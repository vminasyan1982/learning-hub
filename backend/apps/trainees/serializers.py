from rest_framework import serializers
from .models import Trainee, TrainingParticipation


class TraineeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainee
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class TrainingParticipationSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingParticipation
        fields = "__all__"
