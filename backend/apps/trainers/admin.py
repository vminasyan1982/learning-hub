from django.contrib import admin
from .models import Trainer, TrainerDocument


class TrainerDocumentInline(admin.TabularInline):
    model = TrainerDocument
    extra = 0


@admin.register(Trainer)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ["full_name", "email", "is_internal", "is_active", "created_at"]
    list_filter = ["is_internal", "is_active"]
    search_fields = ["first_name", "last_name", "email"]
    inlines = [TrainerDocumentInline]
