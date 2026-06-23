from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Trainer, TrainerDocument
from apps.trainings.models import TrainingMetric


class TrainerDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainerDocument
        fields = ["id", "title", "file", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


class TrainerSerializer(serializers.ModelSerializer):
    documents = TrainerDocumentSerializer(many=True, read_only=True)
    avg_nps = serializers.SerializerMethodField()
    avg_csat = serializers.SerializerMethodField()
    training_count = serializers.SerializerMethodField()

    class Meta:
        model = Trainer
        fields = [
            "id", "first_name", "last_name", "email", "phone", "bio",
            "photo", "trainer_types", "is_internal", "is_active",
            "documents", "avg_nps", "avg_csat", "training_count", "created_at",
        ]
        read_only_fields = ["id", "created_at"]

    def get_avg_nps(self, obj):
        agg = TrainingMetric.objects.filter(training__trainers=obj).aggregate(avg=Avg("nps_score"))
        return round(float(agg["avg"] or 0), 2)

    def get_avg_csat(self, obj):
        agg = TrainingMetric.objects.filter(training__trainers=obj).aggregate(avg=Avg("csat_score"))
        return round(float(agg["avg"] or 0), 2)

    def get_training_count(self, obj):
        return obj.trainings.count()
