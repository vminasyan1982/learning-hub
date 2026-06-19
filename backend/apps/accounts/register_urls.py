from django.urls import path
from .views import ValidateTokenView, RegistrationSubmitView

urlpatterns = [
    path("validate-token/", ValidateTokenView.as_view(), name="register-validate-token"),
    path("", RegistrationSubmitView.as_view(), name="register-submit"),
]
