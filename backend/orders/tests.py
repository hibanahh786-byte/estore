from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from categories.models import Category
from products.models import Product
from orders.models import Order, OrderItem

User = get_user_model()

class OrderTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username="adminuser",
            email="admin@test.com",
            password="AdminPassword123!"
        )
        self.customer1 = User.objects.create_user(
            username="customer1",
            email="c1@test.com",
            password="Customer1Pass!"
        )
        self.customer2 = User.objects.create_user(
            username="customer2",
            email="c2@test.com",
            password="Customer2Pass!"
        )
        self.category = Category.objects.create(name="Gadgets")
        self.product1 = Product.objects.create(
            name="Wireless Mouse",
            price=Decimal("50.00"),
            stock_quantity=5,
            category=self.category
        )
        self.product2 = Product.objects.create(
            name="Mechanical Keyboard",
            price=Decimal("100.00"),
            stock_quantity=2,
            category=self.category
        )

    def test_place_order_calculates_total_and_deducts_stock(self):
        self.client.force_authenticate(user=self.customer1)
        payload = {
            "items": [
                {"product_id": self.product1.id, "quantity": 2},
                {"product_id": self.product2.id, "quantity": 1}
            ],
            # Tamper attempt: frontend attempts to pay 10.00
            "total_amount": "10.00"
        }
        res = self.client.post('/api/orders/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        order = Order.objects.get(id=res.data['order']['id'])
        # Expected: (50.00 * 2) + (100.00 * 1) = 200.00
        self.assertEqual(order.total_amount, Decimal("200.00"))
        self.assertEqual(order.user, self.customer1)
        self.assertEqual(order.status, 'placed')

        # Stock deducted
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.stock_quantity, 3)
        self.assertEqual(self.product2.stock_quantity, 1)

        # Snapshot unit price verified
        item1 = order.items.get(product=self.product1)
        self.assertEqual(item1.unit_price, Decimal("50.00"))

    def test_insufficient_stock_rejects_order_atomically(self):
        self.client.force_authenticate(user=self.customer1)
        # Mouse has 5 available, we request 6
        payload = {
            "items": [
                {"product_id": self.product1.id, "quantity": 6}
            ]
        }
        res = self.client.post('/api/orders/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Insufficient stock for Wireless Mouse", res.data.get('error', ''))

        # Stock should not have changed
        self.product1.refresh_from_db()
        self.assertEqual(self.product1.stock_quantity, 5)
        self.assertEqual(Order.objects.count(), 0)

    def test_customer_cannot_view_another_customer_order(self):
        order = Order.objects.create(
            user=self.customer1,
            total_amount=Decimal("100.00"),
            status='placed'
        )

        self.client.force_authenticate(user=self.customer2)
        res = self.client.get(f'/api/orders/{order.id}/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_cannot_access_admin_orders_list(self):
        self.client.force_authenticate(user=self.customer1)
        res = self.client.get('/api/orders/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_view_all_orders_and_update_status(self):
        order = Order.objects.create(
            user=self.customer1,
            total_amount=Decimal("100.00"),
            status='placed'
        )
        self.client.force_authenticate(user=self.admin)
        
        # Admin lists all orders
        res = self.client.get('/api/orders/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

        # Admin updates status to completed
        patch_res = self.client.patch(f'/api/orders/{order.id}/status/', {"status": "completed"}, format='json')
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, 'completed')
