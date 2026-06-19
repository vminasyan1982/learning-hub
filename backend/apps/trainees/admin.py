from django.contrib import admin
from .models import Trainee, TrainingParticipation


@admin.register(Trainee)
class TraineeAdmin(admin.ModelAdmin):
    list_display = ["full_name", "email", "business_unit", "department", "is_active"]
    list_filter = ["business_unit", "department", "is_active"]
    search_fields = ["first_name", "last_name", "email"]


@admin.register(TrainingParticipation)
class TrainingParticipationAdmin(admin.ModelAdmin):
    list_display = ["trainee", "training", "attended", "completion_date"]
    list_filter = ["attended"]
    search_fields = ["trainee__first_name", "trainee__last_name", "training__title"]
