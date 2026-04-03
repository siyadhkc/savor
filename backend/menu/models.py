from django.db import models
from restaurant.models import Restaurant

class Category(models.Model):
    """
    WHY restaurant ForeignKey?
    In a professional app, categories are specific to each restaurant.
    (e.g., "Paragon's Specials", "Rahmath's Signatures").
    This removes the global "Sharing" issue and makes the menu realistic.
    """
    restaurant = models.ForeignKey(
        Restaurant, 
        on_delete=models.CASCADE, 
        related_name='categories',
        null=True, 
        blank=True
    )
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='menu/categories/', blank=True, null=True)

    def __str__(self):
        if self.restaurant:
            return f"{self.name} ({self.restaurant.name})"
        return self.name

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']
        """
        WHY verbose_name_plural?
        Django Admin would show "Categorys" (wrong English).
        This fixes it to show "Categories" correctly.
        Small detail, but it matters in a professional project.
        """


class Cuisine(models.Model):
    """
    WHY Cuisine?
    Global types (Biryani, Pizza, etc.) that span all restaurants.
    Used for the Home Page "What's on your mind?" section.
    """
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='menu/cuisines/', blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = 'Cuisines'
        ordering = ['name']


class MenuItem(models.Model):
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name='menu_items'
    )
    
    # Restaurant Section (Must Try, etc.)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name='menu_items'
    )

    # Global Cuisine (Biryani, etc.)
    cuisine = models.ForeignKey(
        Cuisine,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='menu_items'
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to='menu/items/', blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_recommended = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"

    class Meta:
        ordering = ['name']