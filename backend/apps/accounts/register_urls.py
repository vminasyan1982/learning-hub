from django.urls import path
from .views import ValidateTokenView, RegistrationSubmitView, LookupListView

urlpatterns = [
    path("validate-token/", ValidateTokenView.as_view(), name="register-validate-token"),
    path("lookups/", LookupListView.as_view(), name="register-lookups"),
    path("", RegistrationSubmitView.as_view(), name="register-submit"),
]
