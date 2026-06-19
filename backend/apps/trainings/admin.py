from django.contrib import admin
from .models import Training, TrainingMetric, BusinessUnit


@admin.register(BusinessUnit)
class BusinessUnitAdmin(admin.ModelAdmin):
    list_display = ["name"]
    search_fields = ["name"]


class TrainingMetricInline(admin.StackedInline):
    model = TrainingMetric
    extra = 1
    max_num = 1


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ["title", "date", "format", "classification", "is_internal", "created_at"]
    list_filter = ["format", "classification", "is_internal", "business_units"]
    search_fields = ["title", "description", "location"]
    filter_horizontal = ["business_units"]
    inlines = [TrainingMetricInline]
    ordering = ["-date"]
