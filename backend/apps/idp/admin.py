from django.contrib import admin
from .models import DevelopmentPlan, DevelopmentGoal


class DevelopmentGoalInline(admin.TabularInline):
    model = DevelopmentGoal
    extra = 0
    fields = ["title", "training", "due_date", "is_completed", "completed_at", "order"]


@admin.register(DevelopmentPlan)
class DevelopmentPlanAdmin(admin.ModelAdmin):
    list_display = ["employee", "title", "year", "status", "created_at"]
    list_filter = ["status", "year"]
    search_fields = ["employee__first_name", "employee__last_name", "employee__username", "title"]
    raw_id_fields = ["employee"]
    inlines = [DevelopmentGoalInline]


@admin.register(DevelopmentGoal)
class DevelopmentGoalAdmin(admin.ModelAdmin):
    list_display = ["title", "plan", "due_date", "is_completed", "order"]
    list_filter = ["is_completed", "due_date"]
    search_fields = ["title", "description", "plan__title", "plan__employee__username"]
    raw_id_fields = ["plan", "training"]
