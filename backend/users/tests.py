from django.urls import reverse
from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser
from restaurant.models import Restaurant
from menu.models import Category, MenuItem


class RegistrationRoleTests(APITestCase):
    def test_public_registration_rejects_admin_role(self):
        response = self.client.post(
            reverse('register'),
            {
                'email': 'admin-try@example.com',
                'username': 'admintry',
                'phone': '9999999999',
                'password': 'StrongPass123!',
                'password2': 'StrongPass123!',
                'role': CustomUser.Role.ADMIN,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('role', response.data)
        self.assertFalse(
            CustomUser.objects.filter(email='admin-try@example.com').exists()
        )

    def test_public_registration_allows_delivery_role(self):
        response = self.client.post(
            reverse('register'),
            {
                'email': 'delivery@example.com',
                'username': 'deliveryagent',
                'phone': '9999999999',
                'password': 'StrongPass123!',
                'password2': 'StrongPass123!',
                'role': CustomUser.Role.DELIVERY,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = CustomUser.objects.get(email='delivery@example.com')
        self.assertEqual(user.role, CustomUser.Role.DELIVERY)


class SeedKeralaCommandTests(APITestCase):
    def test_seed_kerala_creates_unique_restaurant_owners_and_scoped_menu_data(self):
        call_command('seed_kerala')

        restaurants = Restaurant.objects.select_related('owner').all()

        self.assertEqual(restaurants.count(), 30)
        self.assertEqual(restaurants.values_list('owner_id', flat=True).distinct().count(), 30)
        self.assertEqual(restaurants.values_list('owner__email', flat=True).distinct().count(), 30)
        self.assertFalse(restaurants.exclude(owner__role=CustomUser.Role.RESTAURANT).exists())
        self.assertFalse(Category.objects.filter(restaurant__isnull=True).exists())

        for restaurant in restaurants[:5]:
            self.assertEqual(restaurant.categories.count(), 8)
            self.assertEqual(restaurant.menu_items.count(), 100)

        self.assertTrue(
            CustomUser.objects.filter(role=CustomUser.Role.DELIVERY).count() >= 6
        )
        self.assertTrue(
            CustomUser.objects.filter(role=CustomUser.Role.CUSTOMER).count() >= 3
        )
