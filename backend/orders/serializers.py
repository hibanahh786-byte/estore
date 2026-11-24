from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

class OrderItemSerializer(serializers.ModelSerializer):
    product_id = serializers.IntegerField(source='product.id', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.SerializerMethodField()
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product_id',
            'product_name',
            'product_image',
            'quantity',
            'unit_price',
            'subtotal',
        ]
        read_only_fields = ['id', 'product_id', 'product_name', 'product_image', 'quantity', 'unit_price', 'subtotal']

    def get_product_image(self, obj):
        if obj.product and obj.product.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.product.image.url)
            return obj.product.image.url
        return None


class OrderSerializer(serializers.ModelSerializer):
    customer_id = serializers.IntegerField(source='user.id', read_only=True)
    customer_username = serializers.CharField(source='user.username', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'customer_id',
            'customer_username',
            'customer_email',
            'total_amount',
            'status',
            'items',
            'items_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'customer_id', 'customer_username', 'customer_email', 'total_amount', 'created_at', 'updated_at']

    def get_items_count(self, obj):
        return sum(item.quantity for item in obj.items.all())


class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class PlaceOrderSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True, allow_empty=False)


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

    def validate_status(self, value):
        if value not in ['placed', 'completed']:
            raise serializers.ValidationError("Status must be either 'placed' or 'completed'.")
        return value
