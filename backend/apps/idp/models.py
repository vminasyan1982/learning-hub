from django.db import models
from apps.accounts.models import User


class DevelopmentPlan(models.Model):
    STATUS = [
        ("active", "Активный"),
        ("completed", "Завершён"),
        ("paused", "Приостановлен"),
    ]
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="development_plans")
    title = models.CharField(max_length=300, verbose_name="Название плана")
    year = models.PositiveIntegerField(verbose_name="Год")
    status = models.CharField(max_length=20, choices=STATUS, default="active")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "План развития"
        verbose_name_plural = "Планы развития"
        ordering = ["-year", "-created_at"]

    def __str__(self):
        return f"{self.employee} — {self.title} ({self.year})"


class DevelopmentGoal(models.Model):
    plan = models.ForeignKey(DevelopmentPlan, on_delete=models.CASCADE, related_name="goals")
    title = models.CharField(max_length=300, verbose_name="Цель")
    description = models.TextField(blank=True)
    training = models.ForeignKey(
        "trainings.Training",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="idp_goals",
    )
    due_date = models.DateField(null=True, blank=True, verbose_name="Срок")
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Цель развития"
        verbose_name_plural = "Цели развития"
        ordering = ["order", "due_date"]

    def __str__(self):
        return self.title
