from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.conf import settings
from .models import Payment
from .serializers import PaymentSerializer
import razorpay


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Payment.objects.all().order_by('-created_at')
        return Payment.objects.filter(
            order__user=user
        ).order_by('-created_at')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_razorpay_order(request):
    """
    WHY create order on backend, not frontend?
    CRITICAL security rule: never create payment orders
    on the frontend. The amount must come from YOUR
    database — never trust the client to send the amount.
    A malicious user could change the amount to ₹1
    if you calculated it on the frontend.
    Always calculate and create payment orders server-side.
    """
    try:
        order_id = request.data.get('order_id')
        from orders.models import Order
        order = Order.objects.get(id=order_id, user=request.user)

        # Initialize Razorpay client
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        # Amount must be in paise (1 INR = 100 paise)
        amount_in_paise = int(float(order.total_amount) * 100)
        """
        WHY multiply by 100?
        Razorpay works in the smallest currency unit.
        ₹199.00 → 19900 paise
        BEGINNER MISTAKE: sending 199 and wondering why
        Razorpay charges ₹1.99 instead of ₹199.
        """

        razorpay_order = client.order.create({
            'amount': amount_in_paise,
            'currency': 'INR',
            'receipt': f'order_{order.id}',
        })

        # Save razorpay order id to our payment record
        payment = order.payment
        payment.razorpay_order_id = razorpay_order['id']
        payment.save()

        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'amount': amount_in_paise,
            'currency': 'INR',
            'key': settings.RAZORPAY_KEY_ID,
            'order_id': order.id,
        })

    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found.'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    """
    WHY verify payment on backend?
    After user pays, Razorpay gives React a signature.
    We MUST verify this signature on the backend using
    our secret key — this proves the payment is genuine
    and not faked by a malicious user.
    NEVER trust payment confirmation from the frontend alone.
    This is the most critical security step in any
    payment integration.
    """
    try:
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )

        # Verify signature — this is the security check
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature,
        }

        client.utility.verify_payment_signature(params_dict)
        """
        WHY verify_payment_signature()?
        Razorpay signs the payment response with your
        secret key using HMAC-SHA256.
        This method verifies that signature —
        if it fails, the payment data was tampered with.
        If it passes, payment is 100% genuine.
        """

        # Mark payment as successful
        payment = Payment.objects.get(
            razorpay_order_id=razorpay_order_id
        )
        payment.status = 'success'
        payment.save()

        # Send confirmation email
        from django.core.mail import send_mail
        try:
            send_mail(
                subject=f'Order #{payment.order.id} Payment Confirmed! 🎉',
                message=f'''
Hi {payment.order.user.username},

Your payment of ₹{payment.order.total_amount} for Order #{payment.order.id} has been confirmed!

Your food is being prepared. 🍕

Thank you for ordering with FoodDelivery!
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[payment.order.user.email],
                fail_silently=True,
                # """
                # WHY fail_silently=True?
                # If email fails (wrong config, network issue),
                # we don't want the entire payment verification
                # to fail. Payment is confirmed — email is secondary.
                # fail_silently suppresses email errors.
                # """
            )
        except Exception:
            pass

        return Response({
            'message': 'Payment verified successfully!',
            'order_id': payment.order.id,
        })

    except razorpay.errors.SignatureVerificationError:
        # Mark payment as failed
        try:
            payment = Payment.objects.get(
                razorpay_order_id=razorpay_order_id
            )
            payment.status = 'failed'
            payment.save()
        except Exception:
            pass

        return Response(
            {'error': 'Payment verification failed.'},
            status=status.HTTP_400_BAD_REQUEST
        )