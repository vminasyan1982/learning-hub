from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="BusinessUnit",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=255, unique=True)),
            ],
            options={"verbose_name": "Бизнес-юнит", "verbose_name_plural": "Бизнес-юниты", "ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="Training",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=500)),
                ("date", models.DateField()),
                ("end_date", models.DateField(blank=True, null=True)),
                ("location", models.CharField(blank=True, max_length=500)),
                ("format", models.CharField(
                    choices=[("online","Онлайн"),("offline","Офлайн"),("mixed","Смешанный")],
                    max_length=20,
                )),
                ("classification", models.CharField(
                    choices=[
                        ("online_self","Онлайн самостоятельный курс"),
                        ("online_deadline","Онлайн курс с дедлайном"),
                        ("online_mixed","Онлайн смешанный (LMS/EX + воркшоп)"),
                        ("offline_mixed","Офлайн смешанный"),
                        ("online_trainer","Онлайн тренинг с тренером"),
                        ("offline_trainer","Офлайн тренинг с тренером"),
                        ("online_workshop","Онлайн воркшоп с тренером"),
                        ("offline_workshop","Офлайн воркшоп с тренером"),
                        ("online_game","Онлайн бизнес-игра с тренером"),
                        ("offline_game","Офлайн бизнес-игра с тренером"),
                        ("online_strategy","Онлайн стратегическая сессия"),
                        ("offline_strategy","Офлайн стратегическая сессия"),
                        ("online_coaching","Онлайн коучинг"),
                        ("offline_coaching","Офлайн коучинг"),
                        ("online_masterclass","Онлайн мастер-класс"),
                        ("offline_masterclass","Офлайн мастер-класс"),
                        ("online_conference","Онлайн конференция"),
                        ("offline_conference","Офлайн конференция"),
                        ("online_teambuilding","Онлайн тимбилдинг"),
                        ("offline_teambuilding","Офлайн тимбилдинг"),
                    ],
                    max_length=30,
                )),
                ("description", models.TextField(blank=True)),
                ("lms_url", models.URLField(blank=True)),
                ("asana_url", models.URLField(blank=True)),
                ("drive_url", models.URLField(blank=True)),
                ("feedback_url", models.URLField(blank=True)),
                ("is_internal", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("business_units", models.ManyToManyField(
                    blank=True, related_name="trainings", to="trainings.businessunit",
                )),
            ],
            options={"verbose_name": "Тренинг", "verbose_name_plural": "Тренинги", "ordering": ["-date"]},
        ),
        migrations.CreateModel(
            name="TrainingMetric",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("nps_score", models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ("nps_percent", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("csat_score", models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ("csat_percent", models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True)),
                ("business_value", models.SmallIntegerField(blank=True, null=True)),
                ("lh_standards_score", models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ("trainer_rating", models.DecimalField(blank=True, decimal_places=2, max_digits=4, null=True)),
                ("discipline_ok", models.BooleanField(default=True)),
                ("participants_count", models.PositiveIntegerField(default=0)),
                ("notes", models.TextField(blank=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("training", models.OneToOneField(
                    on_delete=models.CASCADE, related_name="metric", to="trainings.training",
                )),
            ],
            options={"verbose_name": "Метрика тренинга", "verbose_name_plural": "Метрики тренингов"},
        ),
    ]
