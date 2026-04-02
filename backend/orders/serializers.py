from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from menu.models import MenuItem
from users.models import CustomUser


class CartItemSerializer(serializers.ModelSerializer):
    """
    WHY show menu_item details here?
    When React renders the cart page, it needs to show
    the item name, price and image — not just an ID number.
    We nest the key details directly in the response.
    """
    menu_item_name = serializers.CharField(
        source='menu_item.name',
        read_only=True
    )
    menu_item_price = serializers.DecimalField(
        source='menu_item.price',
        max_digits=8,
        decimal_places=2,
        read_only=True
    )
    menu_item_image = serializers.ImageField(
        source='menu_item.image',
        read_only=True
    )
    total_price = serializers.ReadOnlyField()
    """
    WHY ReadOnlyField for total_price?
    total_price is a @property on the model — not a real
    database column. ReadOnlyField exposes it in the API
    response without trying to write it to the database.
    BEGINNER MISTAKE: using SerializerMethodField for simple
    properties — ReadOnlyField is cleaner and shorter.
    """

    class Meta:
        model = CartItem
        fields = [
            'id', 'menu_item', 'menu_item_name',
            'menu_item_price', 'menu_item_image',
            'quantity', 'total_price'
        ]


class CartSerializer(serializers.ModelSerializer):
    """
    WHY nest CartItemSerializer inside CartSerializer?
    When React fetches the cart, it needs ALL items
    in one single API call — not a separate call per item.
    Nested serializers return everything in one response.
    This is called eager loading — reduces API calls
    and makes React faster.
    """
    items = CartItemSerializer(many=True, read_only=True)
    """
    WHY many=True?
    A cart has MULTIPLE items.
    many=True tells DRF to serialize a list, not a single object.
    """
    total_items = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    """
    WHY SerializerMethodField?
    These values don't exist as model fields or properties.
    SerializerMethodField lets you run custom Python logic
    to calculate and return any value you need in the API.
    The method name must be get_<field_name>.
    """

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_items', 'total_amount', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def get_total_items(self, obj):
        return obj.items.count()

    def get_total_amount(self, obj):
        """
        WHY calculate here instead of model?
        Total amount changes every time items are added/removed.
        Calculating it fresh in the serializer always gives
        the accurate current total — no risk of stale data.
        """
        return sum(item.total_price for item in obj.items.all())


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(
        source='menu_item.name',
        read_only=True
    )
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'quantity', 'price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    restaurant_address = serializers.CharField(source='restaurant.address', read_only=True)
    delivery_agent_name = serializers.CharField(
        source='delivery_agent.username',
        read_only=True,
        allow_null=True,
    )
    delivery_agent_phone = serializers.CharField(
        source='delivery_agent.phone',
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_email',
            'restaurant', 'restaurant_name', 'restaurant_address',
            'status', 'total_amount', 'address',
            'items', 'created_at', 'updated_at',
            'delivery_agent', 'delivery_agent_name',
            'delivery_agent_phone',
            'delivery_status', 'delivery_lat', 'delivery_lng',
            'accepted_at',
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class OrderLocationSerializer(serializers.ModelSerializer):
    """
    WHY a separate location serializer?
    GPS updates happen every 5-10 seconds. We want a
    super-slim payload — just lat/lng and status.
    Sending the full Order objects during polling
    would be a waste of bandwidth and database IO.
    """
    delivery_agent_name = serializers.CharField(
        source='delivery_agent.username',
        read_only=True,
        allow_null=True,
    )
    last_updated_at = serializers.DateTimeField(source='updated_at', read_only=True)

    class Meta:
        model = Order
        fields = [
            'delivery_lat',
            'delivery_lng',
            'delivery_status',
            'delivery_agent_name',
            'last_updated_at',
        ]


class AssignDeliveryAgentSerializer(serializers.Serializer):
    delivery_agent_id = serializers.PrimaryKeyRelatedField(
        queryset=CustomUser.objects.filter(
            role=CustomUser.Role.DELIVERY,
            is_active=True,
        ),
        write_only=True,
    )

    def validate_delivery_agent_id(self, agent):
        if not agent.is_available:
            raise serializers.ValidationError(
                'The selected delivery agent is currently offline.'
            )
        return agent


class UpdateOrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)


class UpdateDeliveryLocationSerializer(serializers.Serializer):
    delivery_lat = serializers.FloatField(
        required=False,
        min_value=-90,
        max_value=90,
    )
    delivery_lng = serializers.FloatField(
        required=False,
        min_value=-180,
        max_value=180,
    )
    delivery_status = serializers.ChoiceField(
        choices=[
            Order.DeliveryStatus.ACCEPTED,
            Order.DeliveryStatus.PICKED,
            Order.DeliveryStatus.DELIVERING,
            Order.DeliveryStatus.DELIVERED,
        ],
        required=False,
    )

    def validate(self, attrs):
        if not attrs:
            raise serializers.ValidationError(
                'Provide delivery coordinates or a delivery status update.'
            )

        has_lat = 'delivery_lat' in attrs
        has_lng = 'delivery_lng' in attrs
        if has_lat != has_lng:
            raise serializers.ValidationError(
                'delivery_lat and delivery_lng must be sent together.'
            )

        return attrs


class CreateOrderSerializer(serializers.Serializer):
    """
    WHY a separate CreateOrderSerializer?
    Creating an order is complex business logic —
    it's not a simple model create.
    We need to:
    1. Take items from the cart
    2. Calculate total amount
    3. Create the order + order items
    4. Clear the cart
    A plain Serializer (not ModelSerializer) gives us
    full control over this custom flow.
    This is a senior developer pattern — use ModelSerializer
    for simple CRUD, plain Serializer for complex operations.
    """
    address = serializers.CharField()
    payment_method = serializers.ChoiceField(
        choices=['razorpay', 'cod']
    )
