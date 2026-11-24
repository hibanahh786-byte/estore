from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_customer_registration_defaults_to_user_role(self):
        payload = {
            "username": "newcustomer",
            "email": "customer@example.com",
            "password": "StrongPassword123!",
            "role": "admin"  # Tamper attempt
        }
        response = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="newcustomer")
        self.assertEqual(user.role, 'user')
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_duplicate_registration_rejected(self):
        User.objects.create_user(username="existing", email="existing@example.com", password="Password123!")
        payload = {
            "username": "existing",
            "email": "different@example.com",
            "password": "Password123!"
        }
        res = self.client.post('/api/auth/register/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_tokens_and_user_info(self):
        User.objects.create_user(username="testuser", email="test@example.com", password="Password123!")
        payload = {"username": "testuser", "password": "Password123!"}
        res = self.client.post('/api/auth/login/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['username'], 'testuser')
        self.assertEqual(res.data['user']['role'], 'user')

    def test_auth_me_requires_authentication(self):
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
