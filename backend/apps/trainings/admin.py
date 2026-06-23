from django.contrib import admin
from .models import Training, TrainingMetric, BusinessUnit, BudgetPlan


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
    list_display = ["title", "date", "format", "classification", "is_internal", "is_mandatory", "created_at"]
    list_filter = ["format", "classification", "is_internal", "is_mandatory", "business_units"]
    search_fields = ["title", "description", "location"]
    filter_horizontal = ["business_units"]
    inlines = [TrainingMetricInline]
    ordering = ["-date"]
    fieldsets = [
        (None, {
            "fields": ["title", "date", "end_date", "location", "format", "classification", "business_units", "description"],
        }),
        ("Ссылки", {
            "fields": ["lms_url", "asana_url", "drive_url", "feedback_url"],
            "classes": ["collapse"],
        }),
        ("Compliance", {
            "fields": ["is_internal", "is_mandatory", "compliance_deadline"],
        }),
    ]


@admin.register(BudgetPlan)
class BudgetPlanAdmin(admin.ModelAdmin):
    list_display = ["year", "quarter", "business_unit", "category", "planned_amount", "currency"]
    list_filter = ["year", "quarter", "category"]
