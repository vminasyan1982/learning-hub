from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import IsTDTeamOrAdmin
from .models import InternalRegistryEntry, ExternalRegistryEntry
from .serializers import InternalRegistrySerializer, ExternalRegistrySerializer


class InternalRegistryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = InternalRegistrySerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["center", "status", "format", "completed_on_time"]
    search_fields = ["title", "project_manager", "developers", "comments"]
    ordering_fields = ["request_date", "deadline", "status"]
    ordering = ["-request_date"]
    queryset = InternalRegistryEntry.objects.all()


class InternalRegistryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = InternalRegistrySerializer
    queryset = InternalRegistryEntry.objects.all()


class ExternalRegistryListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = ExternalRegistrySerializer
    queryset = ExternalRegistryEntry.objects.all()


class ExternalRegistryDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = ExternalRegistrySerializer
    queryset = ExternalRegistryEntry.objects.all()
