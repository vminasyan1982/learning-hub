from django.db import models


class RegistryCenter(models.TextChoices):
    TD = "td", "T&D"
    ASSESSMENT = "assessment", "Ассессмент-центр"


class RegistryStatus(models.TextChoices):
    NOT_STARTED = "not_started", "Не начат"
    IN_PROGRESS = "in_progress", "В работе"
    ON_HOLD = "on_hold", "На паузе"
    COMPLETED = "completed", "Завершён"
    AT_RISK = "at_risk", "Под риском"
    CANCELLED = "cancelled", "Отменён"
    DONE = "done", "Выполнен"


class InternalRegistryEntry(models.Model):
    request_date = models.DateField(verbose_name="Дата получения")
    center = models.CharField(max_length=20, choices=RegistryCenter.choices, verbose_name="Центр")
    format = models.CharField(max_length=100, blank=True, verbose_name="Формат")
    title = models.CharField(max_length=500, verbose_name="Название запроса")
    asana_url = models.URLField(blank=True, verbose_name="Ссылка Asana")
    project_manager = models.CharField(max_length=255, blank=True, verbose_name="Руководитель проекта")
    developers = models.TextField(blank=True, verbose_name="Разработчики / ответственные")
    deadline = models.DateField(null=True, blank=True, verbose_name="Срок")
    status = models.CharField(
        max_length=20, choices=RegistryStatus.choices,
        default=RegistryStatus.NOT_STARTED, verbose_name="Статус"
    )
    completed_on_time = models.BooleanField(null=True, blank=True, verbose_name="Выполнено в срок")
    materials_url = models.URLField(blank=True, verbose_name="Материалы (Google Drive)")
    comments = models.TextField(blank=True, verbose_name="Комментарии")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Запись Internal Registry"
        verbose_name_plural = "Internal Registry"
        ordering = ["-request_date"]

    def __str__(self):
        return f"{self.title} [{self.get_status_display()}]"


class ExternalRegistryEntry(models.Model):
    """External Registry — will be fully implemented in a later version."""
    title = models.CharField(max_length=500)
    provider = models.CharField(max_length=255, blank=True)
    date = models.DateField(null=True, blank=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, default="AMD")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Запись External Registry"
        verbose_name_plural = "External Registry"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.title} ({self.provider})"
