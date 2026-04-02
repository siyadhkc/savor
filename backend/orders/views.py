from decimal import Decimal
from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.views import APIView
from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartSerializer, CartItemSerializer,
    OrderSerializer, CreateOrderSerializer,
    OrderLocationSerializer,
    AssignDeliveryAgentSerializer,
    UpdateOrderStatusSerializer,
    UpdateDeliveryLocationSerializer,
)
from users.models import CustomUser
from menu.models import MenuItem
from payments.models import Payment

DELIVERY_STATUS_TRANSITIONS = {
    None: {
        Order.DeliveryStatus.ACCEPTED,
        Order.DeliveryStatus.PICKED,
        Order.DeliveryStatus.DELIVERING,
    },
    Order.DeliveryStatus.ASSIGNED: {
        Order.DeliveryStatus.ACCEPTED,
        Order.DeliveryStatus.PICKED,
        Order.DeliveryStatus.DELIVERING,
    },
    Order.DeliveryStatus.ACCEPTED: {
        Order.DeliveryStatus.PICKED,
        Order.DeliveryStatus.DELIVERING,
    },
    Order.DeliveryStatus.PICKED: {
        Order.DeliveryStatus.DELIVERING,
        Order.DeliveryStatus.DELIVERED,
    },
    Order.DeliveryStatus.DELIVERING: {
        Order.DeliveryStatus.DELIVERED,
    },
    Order.DeliveryStatus.DELIVERED: set(),
}


def get_order_queryset():
    return (
        Order.objects
        .select_related('user', 'restaurant', 'delivery_agent')
        .prefetch_related('items__menu_item')
        .order_by('-created_at')
    )


def is_restaurant_owner(user, order):
    return hasattr(user, 'restaurant') and order.restaurant_id == user.restaurant.id


def ensure_admin_or_restaurant_owner(user, order):
    if user.is_staff or is_restaurant_owner(user, order):
        return
    raise PermissionDenied('Only admins or the restaurant owner can update this order.')


def ensure_assigned_delivery_agent(user, order):
    if user.role != CustomUser.Role.DELIVERY or order.delivery_agent_id != user.id:
        raise PermissionDenied('You are not assigned to this order.')


def ensure_location_access(user, order):
    if user.is_staff or order.user_id == user.id or order.delivery_agent_id == user.id:
        if order.status in {Order.Status.DELIVERED, Order.Status.CANCELLED}:
            raise PermissionDenied('Tracking is disabled for completed or cancelled orders.')
        return
    raise PermissionDenied('You do not have permission to view this delivery.')


def update_order_status(order, new_status):
    if order.status == new_status:
        return order

    order.status = new_status
    order.save(update_fields=['status', 'updated_at'])
    return order


def assign_delivery_agent(order, agent):
    if order.status in {Order.Status.CANCELLED, Order.Status.DELIVERED}:
        raise ValidationError('This order can no longer be assigned.')
    if order.delivery_agent_id:
        raise ValidationError('A delivery agent is already assigned to this order.')

    order.delivery_agent = agent
    order.delivery_status = Order.DeliveryStatus.ASSIGNED
    order.delivery_lat = None
    order.delivery_lng = None
    order.accepted_at = None
    order.save(
        update_fields=[
            'delivery_agent',
            'delivery_status',
            'delivery_lat',
            'delivery_lng',
            'accepted_at',
            'updated_at',
        ]
    )
    return order


def validate_delivery_status_transition(order, new_status):
    current_status = order.delivery_status
    if not new_status or new_status == current_status:
        return

    allowed_statuses = DELIVERY_STATUS_TRANSITIONS.get(current_status, set())
    if new_status not in allowed_statuses:
        raise ValidationError(
            {'delivery_status': 'Invalid delivery status transition.'}
        )


def apply_delivery_update(order, validated_data):
    if order.status in {Order.Status.CANCELLED, Order.Status.DELIVERED}:
        raise ValidationError('Completed or cancelled orders can no longer receive GPS updates.')

    new_status = validated_data.get('delivery_status')
    validate_delivery_status_transition(order, new_status)

    if 'delivery_lat' in validated_data:
        order.delivery_lat = validated_data['delivery_lat']
        order.delivery_lng = validated_data['delivery_lng']

    previous_status = order.delivery_status

    if new_status:
        order.delivery_status = new_status

    if order.delivery_status in {
        Order.DeliveryStatus.ACCEPTED,
        Order.DeliveryStatus.PICKED,
        Order.DeliveryStatus.DELIVERING,
    }:
        order.status = Order.Status.OUT_FOR_DELIVERY

    if (
        order.delivery_status == Order.DeliveryStatus.ACCEPTED
        and order.accepted_at is None
    ):
        order.accepted_at = timezone.now()

    delivery_completed_now = (
        previous_status != Order.DeliveryStatus.DELIVERED
        and order.delivery_status == Order.DeliveryStatus.DELIVERED
    )
    if delivery_completed_now:
        order.status = Order.Status.DELIVERED

    order.save()

    if delivery_completed_now and order.delivery_agent:
        agent = order.delivery_agent
        agent.earnings += Decimal('50.00')
        agent.save(update_fields=['earnings'])

    return order


class CartViewSet(viewsets.GenericViewSet):
    """
    WHY GenericViewSet instead of ModelViewSet?
    Cart has special behaviour — each user has exactly
    ONE cart. We don't want the standard list/create/delete
    of ModelViewSet. GenericViewSet gives us the base
    without any automatic actions — we define exactly
    what we need using @action decorator.
    This is precise control vs convenience tradeoff.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_or_create_cart(self, user):
        """
        WHY this helper method?
        Cart is created automatically when first needed.
        User never explicitly creates a cart — it just
        appears when they first add an item.
        This pattern is called "get or create" — very
        common in real applications.
        """
        cart, created = Cart.objects.get_or_create(user=user)
        return cart

    @action(detail=False, methods=['get'])
    def my_cart(self, request):
        """
        WHY @action decorator?
        @action adds custom endpoints to a ViewSet beyond
        the standard CRUD. This creates:
        GET /api/orders/cart/my_cart/
        detail=False means no pk needed in URL (not /cart/1/my_cart/)
        This returns the current user's cart with all items.
        """
        cart = self.get_or_create_cart(request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        POST /api/orders/cart/add_item/
        Body: { "menu_item_id": 1, "quantity": 2 }
        
        WHY get_or_create for CartItem?
        If the item already exists in cart, increase quantity.
        If it's new, create it. This prevents duplicate
        cart items for the same menu item.
        """
        cart = self.get_or_create_cart(request.user)
        menu_item_id = request.data.get('menu_item_id')
        quantity = int(request.data.get('quantity', 1))

        menu_item = get_object_or_404(MenuItem, id=menu_item_id)

        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            menu_item=menu_item,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def remove_item(self, request):
        """
        POST /api/orders/cart/remove_item/
        Body: { "cart_item_id": 1 }
        """
        cart = self.get_or_create_cart(request.user)
        cart_item_id = request.data.get('cart_item_id')
        cart_item = get_object_or_404(CartItem, id=cart_item_id, cart=cart)
        """
        WHY filter by both id AND cart?
        Security! Without cart=cart, a user could delete
        another user's cart items by guessing IDs.
        Always scope queries to the current user's data.
        BEGINNER MISTAKE: only filtering by ID — exposes
        all users' data to manipulation.
        """
        cart_item.delete()
        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        """
        POST /api/orders/cart/update_quantity/
        Body: { "cart_item_id": 1, "quantity": 3 }
        """
        cart = self.get_or_create_cart(request.user)
        cart_item_id = request.data.get('cart_item_id')
        quantity = int(request.data.get('quantity', 1))

        cart_item = get_object_or_404(CartItem, id=cart_item_id, cart=cart)

        if quantity <= 0:
            cart_item.delete()
        else:
            cart_item.quantity = quantity
            cart_item.save()

        serializer = CartSerializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def clear(self, request):
        """
        POST /api/orders/cart/clear/
        Removes all items from cart — called after order placed.
        """
        cart = self.get_or_create_cart(request.user)
        cart.items.all().delete()
        return Response({'message': 'Cart cleared.'})


class OrderViewSet(viewsets.ModelViewSet):
    """
    WHY ModelViewSet here but GenericViewSet for Cart?
    Orders need standard CRUD — list, retrieve, update status.
    But we override create() for our custom order placement logic.
    """
    http_method_names = ['get', 'post', 'head', 'options']
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        WHY override get_queryset()?
        Regular users see ONLY their own orders.
        Admin users see ALL orders.
        This is critical security — never let customers
        see other customers' orders.
        BEGINNER MISTAKE: returning Order.objects.all()
        for everyone — exposes all order data to any user.
        """
        user = self.request.user
        queryset = get_order_queryset()
        if user.is_staff:
            return queryset
        if hasattr(user, 'restaurant'):
            return queryset.filter(restaurant=user.restaurant)
        if user.role == CustomUser.Role.DELIVERY:
            return queryset.filter(delivery_agent=user)
        return queryset.filter(user=user)

    def create(self, request):
        """
        WHY override create()?
        Placing an order is not a simple model create.
        We need to:
        1. Validate the cart has items
        2. Calculate total from cart items
        3. Create Order record
        4. Create OrderItem records (snapshot of prices)
        5. Create Payment record
        6. Clear the cart
        All this must happen atomically — all or nothing.
        """
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        cart = get_object_or_404(
            Cart.objects.prefetch_related('items__menu_item__restaurant'),
            user=request.user,
        )
        cart_items = list(cart.items.all())

        if not cart_items:
            return Response(
                {'error': 'Your cart is empty.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        restaurant_ids = {item.menu_item.restaurant_id for item in cart_items}
        if len(restaurant_ids) != 1:
            return Response(
                {'error': 'Please place separate orders for different restaurants.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        restaurant = cart_items[0].menu_item.restaurant
        total_amount = sum(item.total_price for item in cart_items)

        with transaction.atomic():
            order = Order.objects.create(
                user=request.user,
                restaurant=restaurant,
                address=serializer.validated_data['address'],
                total_amount=total_amount,
                status=Order.Status.PENDING,
                delivery_status=None,
            )

            for cart_item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    menu_item=cart_item.menu_item,
                    quantity=cart_item.quantity,
                    price=cart_item.menu_item.price
                )

            Payment.objects.create(
                order=order,
                method=serializer.validated_data['payment_method'],
                status='pending'
            )

            cart.items.all().delete()

        try:
            send_mail(
                subject=f'Order #{order.id} Placed Successfully! 🎉',
                message=f'''Hi {request.user.username},

Your order #{order.id} has been placed successfully!

Restaurant: {order.restaurant.name}
Total: ₹{order.total_amount}
Address: {order.address}
Payment: {serializer.validated_data["payment_method"].upper()}

We will notify you when your order is ready. 🍕

Thank you for ordering with FoodDelivery!
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[request.user.email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """
        POST /api/orders/orders/1/update_status/
        Body: { "status": "preparing" }
        Admin and restaurant owner only. Customers cannot change their own order status.
        """
        order = self.get_object()
        ensure_admin_or_restaurant_owner(request.user, order)
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        update_order_status(order, serializer.validated_data['status'])
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def assign_delivery(self, request, pk=None):
        """
        POST /api/orders/orders/1/assign_delivery/
        Body: { "delivery_agent_id": 5 }
        Assigns a delivery agent to an order. Admin only.
        """
        order = self.get_object()
        serializer = AssignDeliveryAgentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assign_delivery_agent(order, serializer.validated_data['delivery_agent_id'])
        return Response(OrderSerializer(order).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def update_location(self, request, pk=None):
        """
        POST /api/orders/orders/1/update_location/
        Body: { "delivery_lat": 12.97, "delivery_lng": 77.59, "delivery_status": "delivering" }
        Only the assigned delivery agent can update their location.
        """
        order = self.get_object()
        ensure_assigned_delivery_agent(request.user, order)
        serializer = UpdateDeliveryLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        apply_delivery_update(order, serializer.validated_data)
        return Response(OrderLocationSerializer(order).data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def location(self, request, pk=None):
        """
        GET /api/orders/orders/1/location/
        Retrieves the current location of the delivery agent.
        Available to: Customer (owner), Agent (assigned), Admin.
        """
        order = self.get_object()
        ensure_location_access(request.user, order)
        serializer = OrderLocationSerializer(order)
        return Response(serializer.data)


class OrderActionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_order(self, order_id):
        return get_object_or_404(get_order_queryset(), id=order_id)


class UpdateOrderStatusView(OrderActionAPIView):
    def post(self, request, order_id):
        order = self.get_order(order_id)
        ensure_admin_or_restaurant_owner(request.user, order)
        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        update_order_status(order, serializer.validated_data['status'])
        return Response(OrderSerializer(order).data)


class AssignDeliveryAgentView(OrderActionAPIView):
    permission_classes = [IsAdminUser]

    def post(self, request, order_id):
        order = self.get_order(order_id)
        serializer = AssignDeliveryAgentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        assign_delivery_agent(order, serializer.validated_data['delivery_agent_id'])
        return Response(OrderSerializer(order).data)


class UpdateOrderLocationView(OrderActionAPIView):
    def post(self, request, order_id):
        order = self.get_order(order_id)
        ensure_assigned_delivery_agent(request.user, order)
        serializer = UpdateDeliveryLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        apply_delivery_update(order, serializer.validated_data)
        return Response(OrderLocationSerializer(order).data)


class OrderLocationView(OrderActionAPIView):
    def get(self, request, order_id):
        order = self.get_order(order_id)
        ensure_location_access(request.user, order)
        serializer = OrderLocationSerializer(order)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_id):
    """
    WHY ReportLab?
    PDF requirement from the PDF guidelines.
    ReportLab is the most widely used Python PDF library.
    It gives precise control over layout, tables, fonts.
    We're generating the invoice entirely in Python —
    no HTML to PDF conversion needed.
    """
    try:
        order = get_order_queryset().get(id=order_id)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found.'},
            status=status.HTTP_404_NOT_FOUND
        )

    if not (
        request.user.is_staff
        or order.user_id == request.user.id
        or is_restaurant_owner(request.user, order)
    ):
        return Response(
            {'error': 'Permission denied.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    # Create HTTP response with PDF headers
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = \
        f'attachment; filename="invoice_order_{order.id}.pdf"'
    """
    WHY these headers?
    content_type: tells browser this is a PDF file
    Content-Disposition: 'attachment' triggers download
    filename: what the downloaded file will be named
    """

    # Build PDF
    doc = SimpleDocTemplate(response, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(
        '🍕 FoodDelivery - Order Invoice',
        styles['Title']
    ))
    story.append(Spacer(1, 0.2 * inch))

    # Order Info
    story.append(Paragraph(f'Order #{order.id}', styles['Heading2']))
    story.append(Paragraph(
        f'Date: {order.created_at.strftime("%d %B %Y, %I:%M %p")}',
        styles['Normal']
    ))
    story.append(Paragraph(
        f'Customer: {order.user.username} ({order.user.email})',
        styles['Normal']
    ))
    story.append(Paragraph(
        f'Restaurant: {order.restaurant.name}',
        styles['Normal']
    ))
    story.append(Paragraph(
        f'Delivery Address: {order.address}',
        styles['Normal']
    ))
    story.append(Paragraph(
        f'Status: {order.status.upper()}',
        styles['Normal']
    ))
    story.append(Spacer(1, 0.2 * inch))

    # Items Table
    table_data = [['Item', 'Qty', 'Price', 'Total']]
    for item in order.items.all():
        table_data.append([
            item.menu_item.name if item.menu_item else 'Deleted Item',
            str(item.quantity),
            f'Rs.{item.price}',
            f'Rs.{item.total_price}',
        ])

    # Add total row
    table_data.append(['', '', 'TOTAL', f'Rs.{order.total_amount}'])

    table = Table(table_data, colWidths=[3 * inch, 1 * inch, 1.5 * inch, 1.5 * inch])
    table.setStyle(TableStyle([
        # Header row styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ff4500')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        # Data rows
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f9f9f9')]),
        # Total row
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fff3f0')),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (2, -1), (-1, -1), colors.HexColor('#ff4500')),
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#dddddd')),
        ('PADDING', (0, 0), (-1, -1), 8),
    ]))

    story.append(table)
    story.append(Spacer(1, 0.3 * inch))
    story.append(Paragraph(
        'Thank you for ordering with FoodDelivery! 🍕',
        styles['Normal']
    ))

    doc.build(story)
    return response
