from rest_framework import viewsets, filters
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer


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
            # Some objects (like Category) might not have a restaurant field.
            # In those cases, the global has_permission (above) is sufficient.
            if not hasattr(obj, 'restaurant'):
                return True
            return obj.restaurant == request.user.restaurant
        return False

class CategoryViewSet(viewsets.ModelViewSet):
    """
    Categories are admin/partner-managed to create/edit/delete.
    But anyone can view them to browse the menu.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminOrRestaurantOwner]
        return [permission() for permission in permission_classes]

class MenuItemViewSet(viewsets.ModelViewSet):
    """
    WHY filter by restaurant and category?
    React will call:
    /api/menu/items/?restaurant=1  → all items from restaurant 1
    /api/menu/items/?category=2    → all burgers
    /api/menu/items/?search=chicken → search by name
    This powers the restaurant detail page on the frontend.
    """
    queryset = MenuItem.objects.all().order_by('name')
    serializer_class = MenuItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['restaurant', 'category', 'is_available']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'name']

    def get_queryset(self):
        """
        For ordinary listing, anyone can see everything.
        But for the restaurant-admin panel, we only want to manage
        our own items. Or just provide safety.
        """
        user = self.request.user
        if not user.is_anonymous and hasattr(user, 'restaurant'):
            # Only filter if they are specifically in 'restaurant' management role context?
            # Actually, the frontend already filters. But this is more secure.
            # Wait, if I filter here, customers won't see anything if I'm not careful.
            # Let's only filter if it's NOT a safe method or if it's the admin panel?
            # Better check if the user HAS a restaurant.
            pass
        return super().get_queryset()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminOrRestaurantOwner]
        return [permission() for permission in permission_classes]