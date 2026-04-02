from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from .models import CustomUser
from restaurant.models import Restaurant

class RestaurantRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    restaurant_name = serializers.CharField(write_only=True, required=True)
    restaurant_address = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'phone', 'password', 'password2', 'restaurant_name', 'restaurant_address']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        restaurant_name = validated_data.pop('restaurant_name')
        restaurant_address = validated_data.pop('restaurant_address')
        validated_data.pop('password2')
        
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
            role=CustomUser.Role.RESTAURANT
        )
        
        Restaurant.objects.create(
            owner=user,
            name=restaurant_name,
            address=restaurant_address
        )
        return user

class RegisterSerializer(serializers.ModelSerializer):
    """
    WHY ModelSerializer?
    ModelSerializer automatically creates fields from your model.
    You don't manually write every field — Django reads the model
    and generates them. Less code, fewer mistakes.
    
    BEGINNER MISTAKE: Writing plain Serializer and manually
    defining every field. ModelSerializer does this for you.
    """

    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    """
    WHY write_only=True?
    Password should NEVER appear in API responses.
    write_only means: accept it on input, never show it on output.
    If you forget this, your API will return hashed passwords
    in responses — a serious security mistake.

    WHY validate_password?
    Django's built-in password validator checks:
    - minimum length (8 chars)
    - not too common (not "password123")
    - not entirely numeric
    This runs automatically before saving.
    """

    password2 = serializers.CharField(write_only=True, required=True)
    """
    WHY password2?
    Confirm password field — user types password twice.
    We validate both match before creating the account.
    This field does NOT exist in the model — it's only
    for validation purposes in this serializer.
    """

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'phone', 'password', 'password2', 'role']
        """
        WHY explicitly list fields?
        Never use fields = '__all__' for user serializers.
        '__all__' would expose is_staff, is_superuser, and
        other sensitive fields in your API response.
        Always explicitly list only what you need.
        """

    def validate_role(self, value):
        allowed_roles = {
            CustomUser.Role.CUSTOMER,
            CustomUser.Role.DELIVERY,
        }
        if value not in allowed_roles:
            raise serializers.ValidationError(
                'You can only self-register as a customer or delivery agent.'
            )
        return value

    def validate(self, attrs):
        """
        WHY override validate()?
        validate() runs after individual field validation.
        It's the right place to check cross-field logic
        like password matching — because you need BOTH
        password fields available at the same time.
        """
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                'password': 'Passwords do not match.'
            })
        return attrs

    def create(self, validated_data):
        """
        WHY override create()?
        By default ModelSerializer.create() does a simple
        CustomUser.objects.create(**validated_data).
        BUT this stores the password as plain text — huge security hole.
        We must use create_user() which hashes the password properly.

        BEGINNER MISTAKE #1: Using .create() instead of .create_user()
        Your password will be stored in plain text in the database.
        Anyone with DB access can read all passwords.

        BEGINNER MISTAKE #2: Forgetting to remove password2 from
        validated_data before creating — it's not a model field
        and Django will throw an error.
        """
        validated_data.pop('password2')
        role = validated_data.pop('role', CustomUser.Role.CUSTOMER)
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
            role=role
        )
        return user


from restaurant.serializers import RestaurantSerializer

class UserSerializer(serializers.ModelSerializer):
    """
    UserSerializer is for READING and UPDATING user data.
    Now supports nested restaurant updates for restaurant owners.
    """
    restaurant = RestaurantSerializer(read_only=False, required=False)
    restaurant_id = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'email', 'username', 'phone', 'role', 
            'is_active', 'is_staff', 'created_at', 
            'restaurant_id', 'restaurant', 'earnings', 'is_available'
        ]
        read_only_fields = ['id', 'created_at', 'role', 'is_staff', 'restaurant_id', 'earnings']

    def get_restaurant_id(self, obj):
        if hasattr(obj, 'restaurant'):
            return obj.restaurant.id
        return None

    @transaction.atomic
    def update(self, instance, validated_data):
        """
        WHY override update()?
        By default, DRF ModelSerializer doesn't support nested updates.
        If we send restaurant data, we must manually update the
        related Restaurant instance.
        """
        restaurant_data = validated_data.pop('restaurant', None)
        
        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update Restaurant fields if provided
        if restaurant_data and hasattr(instance, 'restaurant'):
            restaurant = instance.restaurant
            for attr, value in restaurant_data.items():
                setattr(restaurant, attr, value)
            restaurant.save()

        return instance


class DeliveryAgentOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = [
            'id',
            'username',
            'email',
            'phone',
            'is_available',
            'is_active',
            'earnings',
        ]
        read_only_fields = fields
