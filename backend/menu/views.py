from rest_framework import viewsets, filters
from rest_framework.permissions import IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """
    Categories are admin-only to create/edit/delete.
    But anyone can view them to browse the menu.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
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

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]