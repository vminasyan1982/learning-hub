from django.urls import path
from .views import (
    InternalRegistryListCreateView, InternalRegistryDetailView,
    ExternalRegistryListCreateView, ExternalRegistryDetailView,
)

urlpatterns = [
    path("internal/", InternalRegistryListCreateView.as_view(), name="internal-registry-list"),
    path("internal/<int:pk>/", InternalRegistryDetailView.as_view(), name="internal-registry-detail"),
    path("external/", ExternalRegistryListCreateView.as_view(), name="external-registry-list"),
    path("external/<int:pk>/", ExternalRegistryDetailView.as_view(), name="external-registry-detail"),
]
