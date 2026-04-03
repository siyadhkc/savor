from rest_framework import serializers
from .models import Category, MenuItem, Cuisine
from restaurant.models import Restaurant


class CuisineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuisine
        fields = ['id', 'name', 'image']
        read_only_fields = ['id']


class CategorySerializer(serializers.ModelSerializer):
    restaurant = serializers.PrimaryKeyRelatedField(
        queryset=Restaurant.objects.all(),
        required=False,
        write_only=True,
    )

    class Meta:
        model = Category
        fields = ['id', 'name', 'image', 'restaurant']
        read_only_fields = ['id']

    def validate(self, attrs):
        request = self.context.get('request')
        restaurant = attrs.get('restaurant')

        if request and request.user.is_authenticated and hasattr(request.user, 'restaurant') and not request.user.is_staff:
            restaurant = request.user.restaurant
            attrs['restaurant'] = restaurant

        if not restaurant:
            raise serializers.ValidationError({'restaurant': 'Restaurant is required.'})

        name = attrs.get('name', getattr(self.instance, 'name', '')).strip()
        duplicate_qs = Category.objects.filter(restaurant=restaurant, name__iexact=name)
        if self.instance:
            duplicate_qs = duplicate_qs.exclude(pk=self.instance.pk)
        if duplicate_qs.exists():
            raise serializers.ValidationError({'name': 'This restaurant already has a category with that name.'})

        attrs['name'] = name
        return attrs


class MenuItemSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(
        source='restaurant.name',
        read_only=True
    )
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    category_image = serializers.ImageField(
        source='category.image',
        read_only=True
    )
    cuisine_name = serializers.CharField(
        source='cuisine.name',
        read_only=True
    )

    class Meta:
        model = MenuItem
        fields = [
            'id', 'restaurant', 'restaurant_name',
            'category', 'category_name', 'category_image',
            'cuisine', 'cuisine_name',
            'name', 'description', 'price',
            'image', 'is_available', 'is_recommended', 'is_popular', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'restaurant_name', 'category_name', 'cuisine_name']

    def validate(self, attrs):
        request = self.context.get('request')
        restaurant = attrs.get('restaurant', getattr(self.instance, 'restaurant', None))
        category = attrs.get('category', getattr(self.instance, 'category', None))
        name = attrs.get('name', getattr(self.instance, 'name', '')).strip()

        if request and request.user.is_authenticated and hasattr(request.user, 'restaurant') and not request.user.is_staff:
            restaurant = request.user.restaurant
            attrs['restaurant'] = restaurant

        if not restaurant:
            raise serializers.ValidationError({'restaurant': 'Restaurant is required.'})

        if category and category.restaurant_id != restaurant.id:
            raise serializers.ValidationError({'category': 'Selected category does not belong to this restaurant.'})

        duplicate_qs = MenuItem.objects.filter(restaurant=restaurant, name__iexact=name)
        if self.instance:
            duplicate_qs = duplicate_qs.exclude(pk=self.instance.pk)
        if duplicate_qs.exists():
            raise serializers.ValidationError({'name': 'This restaurant already has a menu item with that name.'})

        attrs['name'] = name
        return attrs
