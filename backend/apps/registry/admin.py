from django.contrib import admin
from .models import InternalRegistryEntry, ExternalRegistryEntry


@admin.register(InternalRegistryEntry)
class InternalRegistryAdmin(admin.ModelAdmin):
    list_display = ["title", "center", "status", "project_manager", "deadline", "completed_on_time"]
    list_filter = ["center", "status", "completed_on_time"]
    search_fields = ["title", "project_manager", "developers"]
    ordering = ["-request_date"]


@admin.register(ExternalRegistryEntry)
class ExternalRegistryAdmin(admin.ModelAdmin):
    list_display = ["title", "provider", "date", "cost", "currency"]
    search_fields = ["title", "provider"]
