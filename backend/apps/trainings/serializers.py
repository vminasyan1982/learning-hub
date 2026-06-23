from rest_framework import serializers
from .models import Training, TrainingMetric, BusinessUnit


class BusinessUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessUnit
        fields = ["id", "name"]


class TrainingMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingMetric
        fields = [
            "id", "nps_score", "nps_percent", "csat_score", "csat_percent",
            "business_value", "lh_standards_score", "trainer_rating",
            "discipline_ok", "participants_count", "notes", "updated_at",
        ]


class TrainerNameSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class TrainingSerializer(serializers.ModelSerializer):
    metric = TrainingMetricSerializer(read_only=True)
    business_units = BusinessUnitSerializer(many=True, read_only=True)
    trainers = TrainerNameSerializer(many=True, read_only=True)
    business_unit_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=BusinessUnit.objects.all(), source="business_units", write_only=True, required=False
    )

    class Meta:
        model = Training
        fields = [
            "id", "title", "date", "end_date", "location", "format",
            "classification", "business_units", "business_unit_ids",
            "description", "lms_url", "asana_url", "drive_url", "feedback_url",
            "is_internal", "trainers", "metric", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class TrainingListSerializer(serializers.ModelSerializer):
    metric = TrainingMetricSerializer(read_only=True)
    business_units = BusinessUnitSerializer(many=True, read_only=True)
    trainers = TrainerNameSerializer(many=True, read_only=True)

    class Meta:
        model = Training
        fields = ["id", "title", "date", "format", "classification",
                  "business_units", "is_internal", "trainers", "metric"]
