from rest_framework import serializers
from .models import InternalRegistryEntry, ExternalRegistryEntry


class InternalRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = InternalRegistryEntry
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]


class ExternalRegistrySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalRegistryEntry
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
