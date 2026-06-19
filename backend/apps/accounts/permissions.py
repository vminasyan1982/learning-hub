from rest_framework.permissions import BasePermission
from .models import UserRole


class IsAdminRole(BasePermission):
    """Only users with role=admin can access."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and
                    request.user.role == UserRole.ADMIN)


class IsTDTeamOrAdmin(BasePermission):
    """T&D team members and admins can write; others can only read."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user.role in (UserRole.ADMIN, UserRole.TD_TEAM)


class IsAuthenticatedReadOnly(BasePermission):
    """Authenticated users can read; only TD/Admin can write."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return request.user.role in (UserRole.ADMIN, UserRole.TD_TEAM)
