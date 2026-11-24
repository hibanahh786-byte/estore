from rest_framework import generics, permissions, status
from rest_framework.response import Response
from accounts.permissions import IsAdminUserRole
from .models import Category
from .serializers import CategorySerializer

class CategoryListCreateView(generics.ListCreateAPIView):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            # Public/Customers can list categories
            return [permissions.AllowAny()]
        # Creating categories requires admin role
        return [IsAdminUserRole()]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [IsAdminUserRole()]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # If products are attached, delete them or alert
        self.perform_destroy(instance)
        return Response({"message": "Category deleted successfully."}, status=status.HTTP_200_OK)
