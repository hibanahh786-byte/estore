from rest_framework import serializers
from decimal import Decimal
from categories.models import Category
from categories.serializers import CategorySerializer
from .models import Product

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

class ProductSerializer(serializers.ModelSerializer):
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'price',
            'stock_quantity',
            'image',
            'category',
            'category_name',
            'category_details',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value <= Decimal('0.00'):
            raise serializers.ValidationError("Price must be a positive number greater than 0.")
        return value

    def validate_stock_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock quantity cannot be negative.")
        return value

    def validate_image(self, value):
        if value:
            # Check file size
            if value.size > MAX_IMAGE_SIZE_BYTES:
                raise serializers.ValidationError("Image file size must not exceed 5MB.")
            # Check content type if available
            if hasattr(value, 'content_type') and value.content_type not in ALLOWED_IMAGE_TYPES:
                raise serializers.ValidationError(
                    "Unsupported image format. Allowed formats: JPEG, PNG, WebP, GIF."
                )
        return value
