import os
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.conf import settings
from PIL import Image, ImageDraw
import io

from categories.models import Category
from products.models import Product
from orders.models import Order, OrderItem

User = get_user_model()

def create_tech_image(title, subtitle="", bg_color=(35, 98, 246)):
    """Generate high-tech product visual with Pillow."""
    width, height = 700, 700
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Outer border
    margin = 30
    draw.rectangle(
        [(margin, margin), (width - margin, height - margin)],
        outline=(255, 255, 255),
        width=4
    )

    # Technical corner crosses
    for x in [margin + 15, width - margin - 15]:
        for y in [margin + 15, height - margin - 15]:
            draw.line([(x - 8, y), (x + 8, y)], fill=(255, 255, 255), width=2)
            draw.line([(x, y - 8), (x, y + 8)], fill=(255, 255, 255), width=2)

    # Central Tech Circle / MagSafe Ring
    cx, cy, r = width // 2, height // 2 - 30, 110
    draw.ellipse([(cx - r, cy - r), (cx + r, cy + r)], outline=(255, 255, 255), width=6)
    r2 = 60
    draw.ellipse([(cx - r2, cy - r2), (cx + r2, cy + r2)], outline=(255, 255, 255), width=3)

    # Brand tag
    draw.text((width // 2 - 40, cy - 8), "VOLTCASE", fill=(255, 255, 255))
    draw.text((margin + 25, height - margin - 60), title[:26], fill=(255, 255, 255))
    if subtitle:
        draw.text((margin + 25, height - margin - 35), subtitle[:35], fill=(220, 230, 255))

    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return buffer.getvalue()


class Command(BaseCommand):
    help = "Seeds database with Voltcase tech accessories, categories, and test accounts."

    def add_arguments(self, parser):
        parser.add_argument('--admin-username', type=str, default='admin', help='Admin username')
        parser.add_argument('--admin-email', type=str, default='admin@example.com', help='Admin email')
        parser.add_argument('--admin-password', type=str, default='AdminPass123!', help='Admin password')

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Starting Voltcase store seeding..."))

        admin_user = options['admin_username']
        admin_email = options['admin_email']
        admin_pass = options['admin_password']

        # 1. Create or ensure Admin
        admin = User.objects.filter(username=admin_user).first()
        if not admin:
            admin = User.objects.create_superuser(
                username=admin_user,
                email=admin_email,
                password=admin_pass
            )
            self.stdout.write(self.style.SUCCESS(f"Created Admin account: {admin_user}"))
        else:
            admin.role = 'admin'
            admin.is_staff = True
            admin.is_superuser = True
            admin.set_password(admin_pass)
            admin.save()
            self.stdout.write(self.style.SUCCESS(f"Verified Admin credentials for: {admin_user}"))

        # 2. Create or ensure Customer
        customer = User.objects.filter(username='john').first()
        if not customer:
            customer = User.objects.create_user(
                username='john',
                email='john@example.com',
                password='CustomerPass123!',
                role='user'
            )
            self.stdout.write(self.style.SUCCESS("Created Customer account: john"))
        else:
            customer.set_password('CustomerPass123!')
            customer.save()

        # 3. Create Voltcase Categories
        categories_data = [
            "Phone Cases",
            "Charging & Power",
            "MagSafe Accessories",
            "Cables & Hubs",
            "Tech Bags & Organizers",
        ]

        cat_objs = {}
        for cname in categories_data:
            cat, _ = Category.objects.get_or_create(name=cname)
            cat_objs[cname] = cat
            self.stdout.write(self.style.SUCCESS(f"Ensured category: {cname}"))

        # 4. Create Voltcase Tech Products (matching screenshot)
        voltcase_products = [
            {
                "name": "Cobalt Blue Armor MagSafe Case (iPhone 16 Pro)",
                "price": Decimal("49.00"),
                "stock": 35,
                "category": "Phone Cases",
                "color": (35, 98, 246), # Electric Royal Blue from screenshot!
                "sub": "Engineered For Your Everyday",
                "img": "case_cobalt.png"
            },
            {
                "name": "Stealth Black Armor MagSafe Case (iPhone 16)",
                "price": Decimal("45.00"),
                "stock": 25,
                "category": "Phone Cases",
                "color": (20, 20, 25),
                "sub": "Military-Grade Shock Shield",
                "img": "case_black.png"
            },
            {
                "name": "GaN 65W Dual USB-C Fast Wall Charger",
                "price": Decimal("39.99"),
                "stock": 40,
                "category": "Charging & Power",
                "color": (26, 30, 45),
                "sub": "Ultra-Compact GaN Power",
                "img": "charger_65w.png"
            },
            {
                "name": "Ultra-Slim 10,000mAh Magnetic Power Bank",
                "price": Decimal("59.00"),
                "stock": 20,
                "category": "Charging & Power",
                "color": (15, 60, 150),
                "sub": "MagSafe Wireless Battery Pack",
                "img": "powerbank.png"
            },
            {
                "name": "Braided MagSafe Armor Cable (2m)",
                "price": Decimal("29.99"),
                "stock": 50,
                "category": "Cables & Hubs",
                "color": (30, 35, 55),
                "sub": "Reinforced 100W Fast Charge",
                "img": "cable_braided.png"
            },
            {
                "name": "Aluminum 7-in-1 Desktop Dock & Hub",
                "price": Decimal("79.95"),
                "stock": 15,
                "category": "Cables & Hubs",
                "color": (40, 45, 60),
                "sub": "4K HDMI, 100W PD, Dual USB 3.2",
                "img": "dock_hub.png"
            },
            {
                "name": "AirPods Pro Rugged Armor Magnetic Case",
                "price": Decimal("24.99"),
                "stock": 30,
                "category": "MagSafe Accessories",
                "color": (35, 98, 246),
                "sub": "Locking Lid & Carabiner",
                "img": "airpods_case.png"
            },
            {
                "name": "Waterproof Rugged Tech Gear Cable Organizer",
                "price": Decimal("34.50"),
                "stock": 18,
                "category": "Tech Bags & Organizers",
                "color": (18, 18, 24),
                "sub": "Weatherproof Ballistic Nylon",
                "img": "organizer_pouch.png"
            },
        ]

        # Delete existing orders first due to ProtectedError on OrderItem.product
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        Product.objects.all().delete()

        created_products = []
        for pdata in voltcase_products:
            cat_obj = cat_objs[pdata["category"]]
            product = Product(
                name=pdata["name"],
                price=pdata["price"],
                stock_quantity=pdata["stock"],
                category=cat_obj
            )
            img_bytes = create_tech_image(pdata["name"], pdata["sub"], bg_color=pdata["color"])
            product.image.save(pdata["img"], ContentFile(img_bytes), save=False)
            product.save()
            created_products.append(product)
            self.stdout.write(self.style.SUCCESS(f"Created Voltcase product: {pdata['name']}"))

        # Create sample initial order for customer
        if not Order.objects.filter(user=customer).exists() and len(created_products) >= 2:
            p1 = created_products[0]
            p2 = created_products[2]
            order = Order.objects.create(
                user=customer,
                total_amount=(p1.price * 1) + (p2.price * 1),
                status='placed'
            )
            OrderItem.objects.create(order=order, product=p1, quantity=1, unit_price=p1.price)
            OrderItem.objects.create(order=order, product=p2, quantity=1, unit_price=p2.price)
            self.stdout.write(self.style.SUCCESS("Created initial customer sample order."))

        self.stdout.write(self.style.SUCCESS("Voltcase database seeding completed!"))
