from django.contrib import admin
from .models import PortfolioItem


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ["promo_name", "internal_name", "category", "classification", "language", "participants_count", "is_active", "order"]
    list_editable = ["category", "language", "is_active", "order"]
    list_filter = ["is_active", "language", "category", "classification"]
    search_fields = ["promo_name", "internal_name", "skills"]
    ordering = ["order"]
    fieldsets = [
        ("Основное", {"fields": ["promo_name", "internal_name", "banner", "is_active", "order"]}),
        ("Классификация", {"fields": ["category", "classification", "language"]}),
        ("Детали", {"fields": ["description", "skills", "duration", "participants_count"]}),
        ("Ссылки", {"fields": ["lms_url", "enrollment_info"]}),
    ]
