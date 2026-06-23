import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
        ("trainings", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="DevelopmentPlan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=300, verbose_name="Название плана")),
                ("year", models.PositiveIntegerField(verbose_name="Год")),
                ("status", models.CharField(
                    choices=[("active", "Активный"), ("completed", "Завершён"), ("paused", "Приостановлен")],
                    default="active",
                    max_length=20,
                )),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "employee",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="development_plans",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "План развития",
                "verbose_name_plural": "Планы развития",
                "ordering": ["-year", "-created_at"],
            },
        ),
        migrations.CreateModel(
            name="DevelopmentGoal",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=300, verbose_name="Цель")),
                ("description", models.TextField(blank=True)),
                ("due_date", models.DateField(blank=True, null=True, verbose_name="Срок")),
                ("is_completed", models.BooleanField(default=False)),
                ("completed_at", models.DateField(blank=True, null=True)),
                ("order", models.PositiveIntegerField(default=0)),
                (
                    "plan",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="goals",
                        to="idp.developmentplan",
                    ),
                ),
                (
                    "training",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="idp_goals",
                        to="trainings.training",
                    ),
                ),
            ],
            options={
                "verbose_name": "Цель развития",
                "verbose_name_plural": "Цели развития",
                "ordering": ["order", "due_date"],
            },
        ),
    ]
