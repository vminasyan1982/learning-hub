import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.conf import settings


class UserRole(models.TextChoices):
    ADMIN = "admin", "Администратор"
    MANAGER = "manager", "Руководство / Менеджер"
    TD_TEAM = "td_team", "Команда T&D"
    VIEWER = "viewer", "Просмотр"


class User(AbstractUser):
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.VIEWER)
    department = models.CharField(max_length=255, blank=True)
    business_unit = models.CharField(max_length=255, blank=True)
    position = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    must_change_password = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    @property
    def is_admin_role(self):
        return self.role == UserRole.ADMIN

    @property
    def is_td_team(self):
        return self.role in (UserRole.ADMIN, UserRole.TD_TEAM)


class InvitationToken(models.Model):
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="created_invitations"
    )
    note = models.CharField(max_length=255, blank=True, help_text="Для кого предназначен токен")
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Приглашение"
        verbose_name_plural = "Приглашения"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.pk:
            ttl = getattr(settings, "INVITATION_TOKEN_TTL_HOURS", 48)
            self.expires_at = timezone.now() + timezone.timedelta(hours=ttl)
        super().save(*args, **kwargs)

    @property
    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()

    def __str__(self):
        status = "использован" if self.is_used else ("истёк" if not self.is_valid else "активен")
        return f"Токен {str(self.token)[:8]}… [{status}] {self.note}"


class LookupCategory(models.TextChoices):
    DEPARTMENT = "department", "Отдел"
    POSITION = "position", "Должность"
    BUSINESS_UNIT = "business_unit", "Бизнес-юнит"


class Lookup(models.Model):
    category = models.CharField(max_length=50, choices=LookupCategory.choices)
    name = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Справочник"
        verbose_name_plural = "Справочники"
        ordering = ["category", "order", "name"]
        unique_together = [("category", "name")]

    def __str__(self):
        return f"{self.get_category_display()}: {self.name}"


class RegistrationStatus(models.TextChoices):
    PENDING = "pending", "Ожидает рассмотрения"
    APPROVED = "approved", "Одобрен"
    DENIED = "denied", "Отклонён"


class RegistrationRequest(models.Model):
    invitation = models.OneToOneField(
        InvitationToken, on_delete=models.PROTECT, related_name="registration_request"
    )
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=30, blank=True)
    position = models.CharField(max_length=255)
    department = models.CharField(max_length=255)
    business_unit = models.CharField(max_length=255)
    requested_role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.VIEWER)
    status = models.CharField(max_length=20, choices=RegistrationStatus.choices, default=RegistrationStatus.PENDING)
    denial_reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="reviewed_registrations"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_user = models.OneToOneField(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="registration_request"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Запрос на регистрацию"
        verbose_name_plural = "Запросы на регистрацию"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} <{self.email}> [{self.get_status_display()}]"
