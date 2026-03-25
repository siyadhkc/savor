
# Create your views here.
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Restaurant
from .serializers import RestaurantSerializer


class RestaurantViewSet(viewsets.ModelViewSet):
    """
    WHY ModelViewSet?
    ModelViewSet gives you ALL of these for free:
    
    GET    /api/restaurants/        → list()
    POST   /api/restaurants/        → create()
    GET    /api/restaurants/1/      → retrieve()
    PUT    /api/restaurants/1/      → update()
    PATCH  /api/restaurants/1/      → partial_update()
    DELETE /api/restaurants/1/      → destroy()
    
    All 6 actions from ONE class. This is why the PDF
    recommends ViewSets — maximum functionality,
    minimum code. A senior developer never writes
    separate views for each CRUD action when ViewSet exists.
    """

    queryset = Restaurant.objects.all().order_by('-created_at')
    serializer_class = RestaurantSerializer

    # PDF requirement: search & filter
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['is_active']
    search_fields = ['name', 'address']
    ordering_fields = ['name', 'created_at']
    """
    WHY three filter backends?
    DjangoFilterBackend → exact field filtering
      ?is_active=true   → only active restaurants
    SearchFilter        → keyword search
      ?search=pizza     → restaurants with "pizza" in name
    OrderingFilter      → sort results
      ?ordering=name    → alphabetical order
    These three together give React full control
    over how data is fetched and displayed.
    PDF specifically requires search & filter on listings.
    """

    def get_permissions(self):
        """
        WHY override get_permissions()?
        Different actions need different permissions:
        - Anyone can VIEW restaurants (list, retrieve)
        - Only admins can CREATE, UPDATE, DELETE
        
        This is Role-Based Access Control (RBAC) —
        a PDF mandatory requirement.
        
        get_permissions() lets us set permissions
        per action instead of one permission for all.
        This is the professional way to handle RBAC
        in DRF ViewSets.
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]