import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Skill",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200, verbose_name="Навык")),
                ("category", models.CharField(blank=True, max_length=100, verbose_name="Категория")),
                ("description", models.TextField(blank=True)),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "verbose_name": "Навык",
                "verbose_name_plural": "Навыки",
                "ordering": ["order", "name"],
            },
        ),
        migrations.CreateModel(
            name="EmployeeSkill",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("level", models.IntegerField(
                    choices=[(0, "Нет"), (1, "Базовый"), (2, "Средний"), (3, "Продвинутый"), (4, "Эксперт")],
                    default=0,
                )),
                ("notes", models.TextField(blank=True)),
                ("assessed_at", models.DateField(auto_now=True)),
                (
                    "employee",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="skill_assessments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "skill",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="assessments",
                        to="skills.skill",
                    ),
                ),
            ],
            options={
                "verbose_name": "Оценка навыка",
                "verbose_name_plural": "Оценки навыков",
            },
        ),
        migrations.AlterUniqueTogether(
            name="employeeskill",
            unique_together={("employee", "skill")},
        ),
    ]
