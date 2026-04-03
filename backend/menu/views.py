from rest_framework import viewsets, filters
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, MenuItem, Cuisine
from .serializers import CategorySerializer, MenuItemSerializer, CuisineSerializer


from rest_framework import permissions

class IsAdminOrRestaurantOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_staff or hasattr(request.user, 'restaurant')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.is_staff:
            return True
        if hasattr(request.user, 'restaurant'):
            if not hasattr(obj, 'restaurant'):
                return True
            return obj.restaurant == request.user.restaurant
        return False


class CuisineViewSet(viewsets.ModelViewSet):
    """
    Global cuisines (Biryani, Pizza, etc.) for the Home Page.
    Anyone can view, but only admins can manage them.
    """
    queryset = Cuisine.objects.all()
    serializer_class = CuisineSerializer
    permission_classes = [AllowAny] # Simple for now, can be hardened later


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Categories are now RESTAURANT-SPECIFIC sections (Must Try, Specials).
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['restaurant']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'restaurant') and not user.is_staff:
            return queryset.filter(restaurant=user.restaurant)
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminOrRestaurantOwner]
        return [permission() for permission in permission_classes]


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset = MenuItem.objects.all().order_by('name')
    serializer_class = MenuItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['restaurant', 'category', 'cuisine', 'is_available', 'is_recommended', 'is_popular']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'name']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'restaurant') and not user.is_staff:
            return queryset.filter(restaurant=user.restaurant)
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminOrRestaurantOwner]
        return [permission() for permission in permission_classes]
