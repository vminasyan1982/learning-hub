from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import IsTDTeamOrAdmin
from .models import Trainee, TrainingParticipation
from .serializers import TraineeSerializer, TrainingParticipationSerializer


class TraineeListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = TraineeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["business_unit", "department", "is_active"]
    search_fields = ["first_name", "last_name", "email", "position"]
    ordering_fields = ["last_name", "created_at"]
    ordering = ["last_name"]
    queryset = Trainee.objects.all()


class TraineeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = TraineeSerializer
    queryset = Trainee.objects.all()


class ParticipationListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = TrainingParticipationSerializer
    filterset_fields = ["trainee", "training", "attended"]
    queryset = TrainingParticipation.objects.select_related("trainee", "training").all()
