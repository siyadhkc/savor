from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser


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
        fields = ['id', 'email', 'username', 'phone', 'password', 'password2']
        """
        WHY explicitly list fields?
        Never use fields = '__all__' for user serializers.
        '__all__' would expose is_staff, is_superuser, and
        other sensitive fields in your API response.
        Always explicitly list only what you need.
        """

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
        user = CustomUser.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            phone=validated_data.get('phone', ''),
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    WHY a separate UserSerializer?
    RegisterSerializer is only for creating users.
    UserSerializer is for READING user data — profile page,
    user list in admin panel, current user info, etc.
    Separating read and write serializers is clean architecture.
    """

    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'username', 'phone', 'role', 'is_active','is_staff', 'created_at']
        read_only_fields = ['id', 'created_at', 'role','is_staff']
        """
        WHY read_only_fields?
        id and created_at are auto-generated — never editable.
        role is sensitive — users cannot change their own role
        to 'admin' through the profile API.
        Only a superuser can change roles via Django Admin.
        """
        # WHY add is_staff?
        # React's Navbar checks user.is_staff to show Admin link.
        # Without this field in the API response, user.is_staff
        # is always undefined in React — so Admin link never shows.
        # is_staff is Django's built-in admin permission flag.
        # Superusers have is_staff=True automatically.
        # """