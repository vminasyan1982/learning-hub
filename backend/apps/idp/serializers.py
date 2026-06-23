from rest_framework import serializers
from .models import DevelopmentPlan, DevelopmentGoal


class DevelopmentGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = DevelopmentGoal
        fields = [
            "id",
            "plan",
            "title",
            "description",
            "training",
            "due_date",
            "is_completed",
            "completed_at",
            "order",
        ]
        read_only_fields = ["id"]


class DevelopmentPlanSerializer(serializers.ModelSerializer):
    goals = DevelopmentGoalSerializer(many=True, read_only=True)

    class Meta:
        model = DevelopmentPlan
        fields = [
            "id",
            "employee",
            "title",
            "year",
            "status",
            "notes",
            "created_at",
            "goals",
        ]
        read_only_fields = ["id", "created_at"]
