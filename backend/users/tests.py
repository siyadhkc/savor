from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import CustomUser


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
