from django.contrib import admin
from .models import PortfolioItem


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = ["promo_name", "internal_name", "language", "is_active", "order"]
    list_filter = ["is_active", "language"]
    search_fields = ["promo_name", "internal_name", "skills"]
    ordering = ["order"]
