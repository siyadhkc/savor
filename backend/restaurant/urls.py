from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

"""
WHY DefaultRouter?
Router automatically generates all URL patterns
for a ViewSet. Without it you'd write:

path('restaurants/', views.RestaurantViewSet.as_view({'get': 'list', 'post': 'create'})),
path('restaurants/<pk>/', views.RestaurantViewSet.as_view({'get': 'retrieve', ...})),

With Router you just register once and get ALL of that.
This is the PDF recommended approach.
"""

router = DefaultRouter()
router.register(r'restaurants', views.RestaurantViewSet, basename='restaurant')

urlpatterns = [
    path('', include(router.urls)),
]