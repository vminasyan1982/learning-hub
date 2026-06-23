from rest_framework import serializers
from .models import Skill, EmployeeSkill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category", "description", "order", "is_active"]


class EmployeeSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeSkill
        fields = ["id", "employee", "skill", "level", "notes", "assessed_at"]
        read_only_fields = ["id", "assessed_at"]
