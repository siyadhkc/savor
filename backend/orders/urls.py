from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'cart', views.CartViewSet, basename='cart')
router.register(r'orders', views.OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:order_id>/update-status/', views.UpdateOrderStatusView.as_view(), name='order-update-status'),
    path('<int:order_id>/assign-delivery/', views.AssignDeliveryAgentView.as_view(), name='order-assign-delivery'),
    path('<int:order_id>/update-location/', views.UpdateOrderLocationView.as_view(), name='order-update-location'),
    path('<int:order_id>/location/', views.OrderLocationView.as_view(), name='order-location'),
    path('<int:order_id>/invoice/', views.download_invoice, name='invoice'),
    path('orders/<int:order_id>/invoice/', views.download_invoice, name='legacy-invoice'),
]
