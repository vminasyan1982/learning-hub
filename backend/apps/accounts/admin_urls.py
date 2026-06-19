from django.urls import path
from .views import (
    RegistrationRequestListView, ApproveRegistrationView, DenyRegistrationView,
    InvitationListCreateView,
)

urlpatterns = [
    path("registrations/", RegistrationRequestListView.as_view(), name="admin-registrations"),
    path("registrations/<int:pk>/approve/", ApproveRegistrationView.as_view(), name="admin-approve"),
    path("registrations/<int:pk>/deny/", DenyRegistrationView.as_view(), name="admin-deny"),
    path("invitations/", InvitationListCreateView.as_view(), name="admin-invitations"),
]
