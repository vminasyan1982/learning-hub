from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import IsTDTeamOrAdmin
from .models import Training, TrainingMetric, BusinessUnit
from .serializers import TrainingSerializer, TrainingListSerializer, BusinessUnitSerializer


class TrainingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["format", "classification", "is_internal", "business_units"]
    search_fields = ["title", "description", "location"]
    ordering_fields = ["date", "title"]
    ordering = ["-date"]

    def get_queryset(self):
        return Training.objects.prefetch_related("business_units", "metric").all()

    def get_serializer_class(self):
        if self.request.method == "GET":
            return TrainingListSerializer
        return TrainingSerializer


class TrainingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = TrainingSerializer
    queryset = Training.objects.prefetch_related("business_units", "metric").all()


class BusinessUnitListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = BusinessUnitSerializer
    queryset = BusinessUnit.objects.all()
