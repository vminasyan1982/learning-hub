from rest_framework import generics, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
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


class TrainerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        from apps.trainings.models import Training
        from apps.registry.models import InternalRegistryEntry, RegistryStatus

        trainer = Trainer.objects.get(pk=pk)
        trainings = Training.objects.filter(trainers=trainer).select_related("metric").prefetch_related("business_units")

        in_progress = InternalRegistryEntry.objects.filter(
            status__in=[RegistryStatus.IN_PROGRESS, RegistryStatus.AT_RISK]
        ).count()

        format_counts = {}
        for t in trainings:
            format_counts[t.format] = format_counts.get(t.format, 0) + 1

        history = []
        for t in trainings.order_by("-date"):
            history.append({
                "id": t.id,
                "title": t.title,
                "date": str(t.date) if t.date else None,
                "format": t.format,
                "nps_percent": t.metric.nps_percent if hasattr(t, "metric") and t.metric else None,
                "csat_percent": t.metric.csat_percent if hasattr(t, "metric") and t.metric else None,
                "participants_count": t.metric.participants_count if hasattr(t, "metric") and t.metric else 0,
                "business_units": [bu.name for bu in t.business_units.all()],
            })

        return Response({
            "id": trainer.id,
            "first_name": trainer.first_name,
            "last_name": trainer.last_name,
            "email": trainer.email,
            "phone": trainer.phone,
            "bio": trainer.bio,
            "trainer_types": trainer.trainer_types,
            "is_internal": trainer.is_internal,
            "training_count": len(history),
            "in_progress_count": in_progress,
            "format_breakdown": format_counts,
            "history": history,
        })
