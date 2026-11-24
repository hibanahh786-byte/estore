import getpass
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = "Safely creates or updates an administrator account with admin role permissions."

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, help='Admin username')
        parser.add_argument('--email', type=str, help='Admin email address')
        parser.add_argument('--password', type=str, help='Admin password')

    def handle(self, *args, **options):
        username = options.get('username')
        email = options.get('email')
        password = options.get('password')

        # Interactive prompts if not supplied via CLI flags
        if not username:
            username = input("Enter admin username: ").strip()
        if not email:
            email = input("Enter admin email: ").strip()
        if not password:
            password = getpass.getpass("Enter admin password: ")

        if not username or not email or not password:
            self.stderr.write(self.style.ERROR("Username, email, and password cannot be empty."))
            return

        user = User.objects.filter(username=username).first()
        if user:
            user.email = email
            user.role = 'admin'
            user.is_staff = True
            user.is_superuser = True
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Existing user '{username}' promoted to Admin with updated password."))
        else:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password
            )
            self.stdout.write(self.style.SUCCESS(f"Admin user '{username}' created successfully!"))
