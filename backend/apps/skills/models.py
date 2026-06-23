from django.db import models
from apps.accounts.models import User


class Skill(models.Model):
    name = models.CharField(max_length=200, verbose_name="Навык")
    category = models.CharField(max_length=100, blank=True, verbose_name="Категория")
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Навык"
        verbose_name_plural = "Навыки"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class EmployeeSkill(models.Model):
    LEVELS = [
        (0, "Нет"),
        (1, "Базовый"),
        (2, "Средний"),
        (3, "Продвинутый"),
        (4, "Эксперт"),
    ]
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="skill_assessments")
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name="assessments")
    level = models.IntegerField(choices=LEVELS, default=0)
    notes = models.TextField(blank=True)
    assessed_at = models.DateField(auto_now=True)

    class Meta:
        verbose_name = "Оценка навыка"
        verbose_name_plural = "Оценки навыков"
        unique_together = [("employee", "skill")]

    def __str__(self):
        return f"{self.employee} — {self.skill}: {self.level}"
