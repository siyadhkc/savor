from rest_framework import serializers
from .models import Category, MenuItem
from restaurant.models import Restaurant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'image']
        read_only_fields = ['id']


class MenuItemSerializer(serializers.ModelSerializer):

    # WHY these extra read fields?
    # By default ForeignKey fields return just the ID number.
    # restaurant_name and category_name return the actual names.
    # React can display "Pizza Palace" instead of just "3".
    # read_only=True means they're only in responses, not required in requests.
    restaurant_name = serializers.CharField(
        source='restaurant.name',
        read_only=True
    )
    category_name = serializers.CharField(
        source='category.name',
        read_only=True
    )
    """
    WHY source='restaurant.name'?
    The 'source' argument tells DRF where to get the data.
    'restaurant.name' means: go to the restaurant FK,
    then get its name field.
    This is called a nested field — very common in real APIs.
    """

    class Meta:
        model = MenuItem
        fields = [
            'id', 'restaurant', 'restaurant_name',
            'category', 'category_name',
            'name', 'description', 'price',
            'image', 'is_available', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'restaurant_name', 'category_name']