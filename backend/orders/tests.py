from decimal import Decimal

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from restaurant.models import Restaurant
from users.models import CustomUser

from .models import Order


class DeliveryTrackingAPITests(APITestCase):
    def setUp(self):
        self.admin = CustomUser.objects.create_user(
            email='admin@example.com',
            username='admin',
            password='StrongPass123!',
            role=CustomUser.Role.ADMIN,
            is_staff=True,
        )
        self.customer = CustomUser.objects.create_user(
            email='customer@example.com',
            username='customer',
            password='StrongPass123!',
            role=CustomUser.Role.CUSTOMER,
        )
        self.other_customer = CustomUser.objects.create_user(
            email='other@example.com',
            username='other',
            password='StrongPass123!',
            role=CustomUser.Role.CUSTOMER,
        )
        self.restaurant_owner = CustomUser.objects.create_user(
            email='restaurant@example.com',
            username='restaurant',
            password='StrongPass123!',
            role=CustomUser.Role.RESTAURANT,
        )
        self.restaurant = Restaurant.objects.create(
            owner=self.restaurant_owner,
            name='Test Kitchen',
            address='MG Road, Kochi',
        )
        self.agent = CustomUser.objects.create_user(
            email='agent@example.com',
            username='agent',
            password='StrongPass123!',
            role=CustomUser.Role.DELIVERY,
            is_available=True,
        )
        self.other_agent = CustomUser.objects.create_user(
            email='other-agent@example.com',
            username='otheragent',
            password='StrongPass123!',
            role=CustomUser.Role.DELIVERY,
            is_available=True,
        )
        self.offline_agent = CustomUser.objects.create_user(
            email='offline-agent@example.com',
            username='offlineagent',
            password='StrongPass123!',
            role=CustomUser.Role.DELIVERY,
            is_available=False,
        )
        self.order = Order.objects.create(
            user=self.customer,
            restaurant=self.restaurant,
            total_amount=Decimal('349.00'),
            address='Marine Drive, Kochi',
            status=Order.Status.PREPARING,
            delivery_status=None,
        )

    def test_admin_can_assign_agent_only_once(self):
        self.client.force_authenticate(self.admin)
        url = reverse('order-assign-delivery', kwargs={'order_id': self.order.id})

        response = self.client.post(
            url,
            {'delivery_agent_id': self.agent.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.delivery_agent, self.agent)
        self.assertEqual(self.order.delivery_status, Order.DeliveryStatus.ASSIGNED)

        second_response = self.client.post(
            url,
            {'delivery_agent_id': self.other_agent.id},
            format='json',
        )

        self.assertEqual(second_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.order.refresh_from_db()
        self.assertEqual(self.order.delivery_agent, self.agent)

    def test_admin_cannot_assign_offline_agent(self):
        self.client.force_authenticate(self.admin)
        url = reverse('order-assign-delivery', kwargs={'order_id': self.order.id})

        response = self.client.post(
            url,
            {'delivery_agent_id': self.offline_agent.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('delivery_agent_id', response.data)

    def test_non_admin_cannot_assign_delivery_agent(self):
        self.client.force_authenticate(self.customer)
        url = reverse('order-assign-delivery', kwargs={'order_id': self.order.id})

        response = self.client.post(
            url,
            {'delivery_agent_id': self.agent.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_cannot_assign_before_restaurant_starts_preparing(self):
        self.order.status = Order.Status.PENDING
        self.order.save(update_fields=['status'])
        self.client.force_authenticate(self.admin)
        url = reverse('order-assign-delivery', kwargs={'order_id': self.order.id})

        response = self.client.post(
            url,
            {'delivery_agent_id': self.agent.id},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_assigned_delivery_agent_must_follow_accept_pick_deliver_flow(self):
        self.order.delivery_agent = self.agent
        self.order.delivery_status = Order.DeliveryStatus.ASSIGNED
        self.order.save()
        self.client.force_authenticate(self.agent)
        url = reverse('order-update-location', kwargs={'order_id': self.order.id})

        accept_response = self.client.post(
            url,
            {'delivery_status': Order.DeliveryStatus.ACCEPTED},
            format='json',
        )

        self.assertEqual(accept_response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PREPARING)
        self.assertIsNotNone(self.order.accepted_at)

        invalid_response = self.client.post(
            url,
            {
                'delivery_status': Order.DeliveryStatus.DELIVERING,
                'delivery_lat': 9.9312,
                'delivery_lng': 76.2673,
            },
            format='json',
        )

        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)

        pick_response = self.client.post(
            url,
            {'delivery_status': Order.DeliveryStatus.PICKED},
            format='json',
        )

        self.assertEqual(pick_response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.OUT_FOR_DELIVERY)

        location_response = self.client.post(
            url,
            {
                'delivery_status': Order.DeliveryStatus.DELIVERING,
                'delivery_lat': 9.9312,
                'delivery_lng': 76.2673,
            },
            format='json',
        )

        self.assertEqual(location_response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.delivery_status, Order.DeliveryStatus.DELIVERING)
        self.assertEqual(self.order.delivery_lat, 9.9312)
        self.assertEqual(self.order.delivery_lng, 76.2673)

    def test_unassigned_delivery_agent_cannot_update_location(self):
        self.order.delivery_agent = self.agent
        self.order.delivery_status = Order.DeliveryStatus.ASSIGNED
        self.order.save()
        self.client.force_authenticate(self.other_agent)
        url = reverse('order-update-location', kwargs={'order_id': self.order.id})

        response = self.client.post(
            url,
            {'delivery_status': Order.DeliveryStatus.DELIVERING},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_can_view_own_order_location_but_other_customer_cannot(self):
        self.order.delivery_agent = self.agent
        self.order.delivery_status = Order.DeliveryStatus.DELIVERING
        self.order.delivery_lat = 9.9312
        self.order.delivery_lng = 76.2673
        self.order.save()
        url = reverse('order-location', kwargs={'order_id': self.order.id})

        self.client.force_authenticate(self.customer)
        owner_response = self.client.get(url)
        self.assertEqual(owner_response.status_code, status.HTTP_200_OK)
        self.assertEqual(owner_response.data['delivery_status'], Order.DeliveryStatus.DELIVERING)

        self.client.force_authenticate(self.other_customer)
        other_response = self.client.get(url)
        self.assertEqual(other_response.status_code, status.HTTP_403_FORBIDDEN)

    def test_marking_delivery_complete_updates_main_status_and_earnings(self):
        self.order.delivery_agent = self.agent
        self.order.delivery_status = Order.DeliveryStatus.DELIVERING
        self.order.status = Order.Status.OUT_FOR_DELIVERY
        self.order.save()
        self.client.force_authenticate(self.agent)
        url = reverse('order-update-location', kwargs={'order_id': self.order.id})

        response = self.client.post(
            url,
            {'delivery_status': Order.DeliveryStatus.DELIVERED},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.agent.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.DELIVERED)
        self.assertEqual(self.order.delivery_status, Order.DeliveryStatus.DELIVERED)
        self.assertEqual(self.agent.earnings, Decimal('50.00'))

    def test_restaurant_cannot_mark_order_out_for_delivery_directly(self):
        self.client.force_authenticate(self.restaurant_owner)
        url = reverse('order-update-status', kwargs={'order_id': self.order.id})

        response = self.client.post(
            url,
            {'status': Order.Status.OUT_FOR_DELIVERY},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
