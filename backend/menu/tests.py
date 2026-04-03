from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import CustomUser
from restaurant.models import Restaurant
from menu.models import Category, MenuItem, Cuisine


class MenuOwnershipTests(APITestCase):
    def setUp(self):
        self.owner_one = CustomUser.objects.create_user(
            email='owner1@example.com',
            username='owner1',
            password='password123',
            role=CustomUser.Role.RESTAURANT,
        )
        self.owner_two = CustomUser.objects.create_user(
            email='owner2@example.com',
            username='owner2',
            password='password123',
            role=CustomUser.Role.RESTAURANT,
        )
        self.admin = CustomUser.objects.create_user(
            email='admin@example.com',
            username='adminuser',
            password='password123',
            role=CustomUser.Role.ADMIN,
            is_staff=True,
            is_superuser=True,
        )
        self.restaurant_one = Restaurant.objects.create(
            owner=self.owner_one,
            name='Owner One Kitchen',
            address='Kochi',
            cuisine='Kerala',
        )
        self.restaurant_two = Restaurant.objects.create(
            owner=self.owner_two,
            name='Owner Two Kitchen',
            address='Kozhikode',
            cuisine='Malabar',
        )
        self.cuisine = Cuisine.objects.create(name='Biryani')
        self.category_one = Category.objects.create(restaurant=self.restaurant_one, name='Best Sellers')
        self.category_two = Category.objects.create(restaurant=self.restaurant_two, name='Mandhi')
        self.item_one = MenuItem.objects.create(
            restaurant=self.restaurant_one,
            category=self.category_one,
            cuisine=self.cuisine,
            name='Chicken Biryani',
            price='220.00',
        )
        self.item_two = MenuItem.objects.create(
            restaurant=self.restaurant_two,
            category=self.category_two,
            cuisine=self.cuisine,
            name='Mutton Mandhi',
            price='320.00',
        )

    def test_restaurant_owner_only_sees_own_categories_and_items(self):
        self.client.force_authenticate(self.owner_one)

        category_response = self.client.get(reverse('category-list'))
        item_response = self.client.get(reverse('menuitem-list'))

        self.assertEqual(category_response.status_code, status.HTTP_200_OK)
        self.assertEqual(item_response.status_code, status.HTTP_200_OK)
        self.assertEqual(category_response.data['count'], 1)
        self.assertEqual(item_response.data['count'], 1)
        self.assertEqual(category_response.data['results'][0]['id'], self.category_one.id)
        self.assertEqual(item_response.data['results'][0]['id'], self.item_one.id)

    def test_restaurant_owner_cannot_attach_item_to_another_restaurant_category(self):
        self.client.force_authenticate(self.owner_one)

        response = self.client.post(
            reverse('menuitem-list'),
            {
                'restaurant': self.restaurant_two.id,
                'category': self.category_two.id,
                'cuisine': self.cuisine.id,
                'name': 'Cross Tenant Dish',
                'description': 'Should fail',
                'price': '199.00',
                'is_available': True,
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('category', response.data)
        self.assertFalse(MenuItem.objects.filter(name='Cross Tenant Dish').exists())

    def test_admin_can_create_category_for_specific_restaurant(self):
        self.client.force_authenticate(self.admin)

        response = self.client.post(
            reverse('category-list'),
            {
                'restaurant': self.restaurant_two.id,
                'name': 'Family Meals',
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            Category.objects.filter(
                restaurant=self.restaurant_two,
                name='Family Meals',
            ).exists()
        )
