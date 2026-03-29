from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'payments', views.PaymentViewSet, basename='payment')

urlpatterns = [
    path('', include(router.urls)),
    path('create-razorpay-order/', views.create_razorpay_order),
    path('verify-payment/', views.verify_payment),
]