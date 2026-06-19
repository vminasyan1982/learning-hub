from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils import timezone
from django.conf import settings
from .models import User, InvitationToken, RegistrationRequest, RegistrationStatus, Lookup, LookupCategory
from .email import send_registration_approved, send_registration_denied
from .views import _generate_temp_password, _make_username
from django.contrib.auth.hashers import make_password


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "get_full_name", "email", "role_badge", "department", "business_unit", "is_active", "date_joined"]
    list_filter = ["role", "is_active", "department"]
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering = ["-date_joined"]
    fieldsets = BaseUserAdmin.fieldsets + (
        ("Learning Hub", {"fields": ("role", "department", "business_unit", "position", "phone", "must_change_password")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Learning Hub", {"fields": ("role", "department", "business_unit", "position", "phone")}),
    )

    @admin.display(description="Роль")
    def role_badge(self, obj):
        colors = {"admin": "#ED484E", "manager": "#0071A3", "td_team": "#00A958", "viewer": "#888"}
        color = colors.get(obj.role, "#888")
        return format_html('<span style="background:{};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">{}</span>', color, obj.get_role_display())


@admin.register(InvitationToken)
class InvitationTokenAdmin(admin.ModelAdmin):
    list_display = ["short_token", "note", "created_by", "status_badge", "expires_at", "invite_link_col", "created_at"]
    list_filter = ["is_used"]
    search_fields = ["note", "created_by__username"]
    readonly_fields = ["token", "is_used", "expires_at", "created_at", "invite_link"]
    ordering = ["-created_at"]

    def _get_invite_url(self, obj):
        base = getattr(settings, "FRONTEND_URL", "https://185.157.245.247")
        return f"{base}/register?token={obj.token}"

    @admin.display(description="Токен")
    def short_token(self, obj):
        return str(obj.token)[:8] + "…"

    @admin.display(description="Статус")
    def status_badge(self, obj):
        if obj.is_used:
            return format_html('<span style="color:#888">использован</span>')
        if not obj.is_valid:
            return format_html('<span style="color:#ED484E">истёк</span>')
        return format_html('<span style="color:#00A958">активен</span>')

    @admin.display(description="Ссылка (копировать)")
    def invite_link_col(self, obj):
        url = self._get_invite_url(obj)
        return format_html(
            '<button type="button" onclick="navigator.clipboard.writeText(\'{url}\').then(()=>{{this.textContent=\'✓ скопировано\';setTimeout(()=>this.textContent=\'📋 копировать\',2000)}})" '
            'style="cursor:pointer;background:#00A958;color:#fff;border:none;padding:3px 10px;border-radius:4px;font-size:12px">📋 копировать</button>',
            url=url,
        )

    @admin.display(description="Ссылка приглашения")
    def invite_link(self, obj):
        url = self._get_invite_url(obj)
        return format_html(
            '<a href="{url}" target="_blank">{url}</a>'
            '<br><small style="color:#888">⚠️ При открытии браузер покажет предупреждение SSL — нажмите «Дополнительно» → «Перейти на сайт»</small>',
            url=url,
        )

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Lookup)
class LookupAdmin(admin.ModelAdmin):
    list_display = ["category", "name", "order", "is_active"]
    list_filter = ["category", "is_active"]
    search_fields = ["name"]
    list_editable = ["order", "is_active"]
    ordering = ["category", "order", "name"]


@admin.register(RegistrationRequest)
class RegistrationRequestAdmin(admin.ModelAdmin):
    list_display = ["full_name", "email", "position", "department", "business_unit", "requested_role", "status_badge", "created_at"]
    list_filter = ["status", "requested_role", "business_unit"]
    search_fields = ["first_name", "last_name", "email"]
    readonly_fields = ["created_at", "updated_at", "reviewed_by", "reviewed_at", "created_user"]
    ordering = ["-created_at"]
    actions = ["approve_selected", "deny_selected"]

    @admin.display(description="ФИО")
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    @admin.display(description="Статус")
    def status_badge(self, obj):
        colors = {"pending": "#FF6D66", "approved": "#00A958", "denied": "#ED484E"}
        color = colors.get(obj.status, "#888")
        return format_html('<span style="background:{};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">{}</span>', color, obj.get_status_display())

    @admin.action(description="Одобрить выбранные заявки (роль viewer)")
    def approve_selected(self, request, queryset):
        approved = 0
        for reg in queryset.filter(status=RegistrationStatus.PENDING):
            temp_password = _generate_temp_password()
            username = _make_username(reg.first_name, reg.last_name, reg.email)
            user = User.objects.create(
                username=username, email=reg.email,
                first_name=reg.first_name, last_name=reg.last_name,
                role=reg.requested_role, department=reg.department,
                business_unit=reg.business_unit, position=reg.position,
                phone=reg.phone, password=make_password(temp_password),
                must_change_password=True,
            )
            reg.status = RegistrationStatus.APPROVED
            reg.reviewed_by = request.user
            reg.reviewed_at = timezone.now()
            reg.created_user = user
            reg.save()
            send_registration_approved(user, temp_password)
            approved += 1
        self.message_user(request, f"Одобрено {approved} заявок.")

    @admin.action(description="Отклонить выбранные заявки")
    def deny_selected(self, request, queryset):
        denied = 0
        for reg in queryset.filter(status=RegistrationStatus.PENDING):
            reg.status = RegistrationStatus.DENIED
            reg.reviewed_by = request.user
            reg.reviewed_at = timezone.now()
            reg.save()
            send_registration_denied(reg)
            denied += 1
        self.message_user(request, f"Отклонено {denied} заявок.")
