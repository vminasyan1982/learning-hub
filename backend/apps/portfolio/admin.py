from django.contrib import admin
from .models import PortfolioItem


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ["promo_name", "internal_name", "language", "participants_count", "is_active", "order"]
    list_filter = ["is_active", "language"]
    search_fields = ["promo_name", "internal_name", "skills"]
    ordering = ["order"]
    fieldsets = [
        ("Main", {"fields": ["promo_name", "internal_name", "banner", "is_active", "order"]}),
        ("Details", {"fields": ["description", "skills", "language", "duration", "participants_count"]}),
        ("Links", {"fields": ["lms_url", "enrollment_info"]}),
    ]
