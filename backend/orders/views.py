from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import models
from django.core.exceptions import ValidationError
from accounts.permissions import IsAdminUserRole, IsCustomerRole
from .models import Order
from .serializers import (
    OrderSerializer,
    PlaceOrderSerializer,
    OrderStatusUpdateSerializer
)
from .services import place_order, InsufficientStockException

class OrderRootView(APIView):
    """
    Handles GET /api/orders/ (Admin view all orders)
    and POST /api/orders/ (Customer place order)
    """
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAdminUserRole()]
        return [permissions.IsAuthenticated()]

    def get(self, request):
        queryset = Order.objects.select_related('user').prefetch_related('items__product').order_by('-created_at')
        
        # Filter by status
        status_param = request.query_params.get('status')
        if status_param and status_param in ['placed', 'completed']:
            queryset = queryset.filter(status=status_param)

        # Search by order ID, customer username or email
        search = request.query_params.get('search')
        if search:
            search = search.strip()
            if search.isdigit():
                queryset = queryset.filter(id=int(search))
            else:
                queryset = queryset.filter(
                    models.Q(user__username__icontains=search) |
                    models.Q(user__email__icontains=search)
                )

        serializer = OrderSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PlaceOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        items_data = serializer.validated_data.get('items', [])
        
        try:
            order = place_order(request.user, items_data)
            response_serializer = OrderSerializer(order, context={'request': request})
            return Response(
                {
                    "message": "Order placed successfully.",
                    "order": response_serializer.data
                },
                status=status.HTTP_201_CREATED
            )
        except InsufficientStockException as e:
            return Response(
                {"error": e.message},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValidationError as e:
            return Response(
                {"error": str(e.message if hasattr(e, 'message') else e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"error": f"An error occurred while processing your order: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MyOrdersListView(generics.ListAPIView):
    """
    GET /api/orders/my-orders/
    Returns orders placed by the current authenticated customer.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__product').order_by('-created_at')


class AdminOrderListView(generics.ListAPIView):
    """
    GET /api/orders/
    Admin-only endpoint to view all customer orders with filters and search.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        queryset = Order.objects.select_related('user').prefetch_related('items__product').order_by('-created_at')
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param and status_param in ['placed', 'completed']:
            queryset = queryset.filter(status=status_param)

        # Search by order ID, customer username or email
        search = self.request.query_params.get('search')
        if search:
            search = search.strip()
            if search.isdigit():
                queryset = queryset.filter(id=int(search))
            else:
                queryset = queryset.filter(
                    models.Q(user__username__icontains=search) |
                    models.Q(user__email__icontains=search)
                )

        return queryset


class OrderDetailView(APIView):
    """
    GET /api/orders/{id}/
    Retrieves order details.
    Admins can view any order; customers can only view their own orders.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        try:
            order = Order.objects.select_related('user').prefetch_related('items__product').get(id=id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Ownership or admin check
        is_admin = request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser
        if not is_admin and order.user != request.user:
            return Response(
                {"error": "You do not have permission to access this order."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminOrderStatusUpdateView(APIView):
    """
    PATCH /api/orders/{id}/status/
    Admin-only endpoint to update order status (e.g. from placed to completed).
    """
    permission_classes = [IsAdminUserRole]

    def patch(self, request, id):
        try:
            order = Order.objects.get(id=id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Order status updated successfully.",
                "order": OrderSerializer(order, context={'request': request}).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
