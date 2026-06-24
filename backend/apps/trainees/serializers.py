from rest_framework import serializers
from .models import Trainee, TrainingParticipation


class TraineeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trainee
        fields = "__all__"
        read_only_fields = ["id", "created_at"]


class TrainingParticipationSerializer(serializers.ModelSerializer):
    trainee_name = serializers.SerializerMethodField()
    trainee_position = serializers.SerializerMethodField()
    trainee_department = serializers.SerializerMethodField()

    class Meta:
        model = TrainingParticipation
        fields = ["id", "trainee", "training", "attended", "completion_date",
                  "notes", "trainee_name", "trainee_position", "trainee_department"]

    def get_trainee_name(self, obj):
        return f"{obj.trainee.first_name} {obj.trainee.last_name}"

    def get_trainee_position(self, obj):
        return obj.trainee.position

    def get_trainee_department(self, obj):
        return obj.trainee.department
