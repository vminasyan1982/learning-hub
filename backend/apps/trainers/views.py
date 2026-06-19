from rest_framework import generics, filters
from apps.accounts.permissions import IsTDTeamOrAdmin
from .models import Trainer, TrainerDocument
from .serializers import TrainerSerializer, TrainerDocumentSerializer


class TrainerListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = TrainerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["first_name", "last_name", "bio"]
    ordering_fields = ["last_name", "created_at"]
    ordering = ["last_name"]
    queryset = Trainer.objects.prefetch_related("documents").all()


class TrainerDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = TrainerSerializer
    queryset = Trainer.objects.prefetch_related("documents").all()


class TrainerDocumentCreateView(generics.CreateAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = TrainerDocumentSerializer

    def perform_create(self, serializer):
        serializer.save(trainer_id=self.kwargs["trainer_pk"])
