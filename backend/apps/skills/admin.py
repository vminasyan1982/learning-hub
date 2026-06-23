from django.contrib import admin
from .models import Skill, EmployeeSkill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "order", "is_active"]
    list_filter = ["is_active", "category"]
    search_fields = ["name", "category", "description"]
    ordering = ["order", "name"]


@admin.register(EmployeeSkill)
class EmployeeSkillAdmin(admin.ModelAdmin):
    list_display = ["employee", "skill", "level", "assessed_at"]
    list_filter = ["level", "skill__category"]
    search_fields = ["employee__first_name", "employee__last_name", "employee__username", "skill__name"]
    raw_id_fields = ["employee", "skill"]
