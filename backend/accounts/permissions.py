from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to authenticated users with admin role or superusers.
    """
    message = "Admin access required for this action."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser)
        )


class IsCustomerRole(permissions.BasePermission):
    """
    Allows access only to authenticated users with customer ('user') role.
    """
    message = "Customer access required for this action."

    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role == 'user'
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to allow owners of an object or admins to access it.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'admin' or request.user.is_staff or request.user.is_superuser:
            return True
        # For Order or other user-tied objects
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return obj == request.user
