from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from categories.models import Category
from products.models import Product

User = get_user_model()

class ProductTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            username="adminuser",
            email="admin@test.com",
            password="AdminPassword123!"
        )
        self.customer = User.objects.create_user(
            username="custuser",
            email="cust@test.com",
            password="CustPassword123!"
        )
        self.category = Category.objects.create(name="Tech")
        self.product = Product.objects.create(
            name="Laptop",
            price=Decimal("999.99"),
            stock_quantity=10,
            category=self.category
        )

    def test_customer_can_list_and_filter_products(self):
        self.client.force_authenticate(user=self.customer)
        res = self.client.get('/api/products/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

        # Filter by category
        res = self.client.get(f'/api/products/?category={self.category.id}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)

    def test_customer_cannot_create_product(self):
        self.client.force_authenticate(user=self.customer)
        payload = {
            "name": "Tablet",
            "price": "499.99",
            "stock_quantity": 5,
            "category": self.category.id
        }
        res = self.client.post('/api/products/', payload)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create_product(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            "name": "Tablet",
            "price": "499.99",
            "stock_quantity": 5,
            "category": self.category.id
        }
        res = self.client.post('/api/products/', payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 2)
