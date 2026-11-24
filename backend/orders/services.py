from decimal import Decimal
from django.db import transaction
from django.core.exceptions import ValidationError
from products.models import Product
from .models import Order, OrderItem

class InsufficientStockException(Exception):
    def __init__(self, message, product=None, available=0, requested=0):
        super().__init__(message)
        self.message = message
        self.product = product
        self.available = available
        self.requested = requested


def place_order(user, items_data):
    """
    Atomic business service to place a customer order.
    1. Validates products and positive quantities.
    2. Locks product rows using select_for_update() within an atomic transaction.
    3. Verifies stock availability.
    4. Computes true total amount on the server.
    5. Deducts inventory.
    6. Creates Order and OrderItem records.
    """
    if not items_data or not isinstance(items_data, list):
        raise ValidationError("Order must contain at least one item.")

    # Aggregate quantities by product_id in case client sent duplicates
    aggregated_items = {}
    for item in items_data:
        try:
            product_id = int(item.get('product_id'))
            quantity = int(item.get('quantity'))
        except (ValueError, TypeError):
            raise ValidationError("Invalid product ID or quantity format.")

        if quantity <= 0:
            raise ValidationError("Quantity must be a positive integer greater than 0.")

        aggregated_items[product_id] = aggregated_items.get(product_id, 0) + quantity

    if not aggregated_items:
        raise ValidationError("No items to order.")

    product_ids = list(aggregated_items.keys())

    # Execute inside atomic transaction with row locking
    with transaction.atomic():
        # Lock selected products to avoid race conditions and concurrent overselling
        products = Product.objects.select_for_update().filter(id__in=product_ids)
        product_map = {p.id: p for p in products}

        # Check if all requested products exist
        for pid in product_ids:
            if pid not in product_map:
                raise ValidationError(f"Product with ID {pid} was not found.")

        # Check stock for all items
        for pid, requested_qty in aggregated_items.items():
            product = product_map[pid]
            if product.stock_quantity < requested_qty:
                raise InsufficientStockException(
                    message=f"Insufficient stock for {product.name}. Available: {product.stock_quantity}, Requested: {requested_qty}",
                    product=product,
                    available=product.stock_quantity,
                    requested=requested_qty
                )

        # Calculate total amount on server
        total_amount = Decimal('0.00')
        order_items_to_create = []

        for pid, qty in aggregated_items.items():
            product = product_map[pid]
            unit_price = product.price
            total_amount += unit_price * qty

        # Create Order record
        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            status='placed'
        )

        # Deduct stock and build OrderItem records
        for pid, qty in aggregated_items.items():
            product = product_map[pid]
            order_items_to_create.append(
                OrderItem(
                    order=order,
                    product=product,
                    quantity=qty,
                    unit_price=product.price
                )
            )
            product.stock_quantity -= qty
            product.save(update_fields=['stock_quantity', 'updated_at'])

        # Bulk create order items
        OrderItem.objects.bulk_create(order_items_to_create)

        return order
