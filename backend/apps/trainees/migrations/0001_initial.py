from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("trainings", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Trainee",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("first_name", models.CharField(max_length=150)),
                ("last_name", models.CharField(max_length=150)),
                ("email", models.EmailField(blank=True)),
                ("position", models.CharField(blank=True, max_length=255)),
                ("department", models.CharField(blank=True, max_length=255)),
                ("business_unit", models.CharField(blank=True, max_length=255)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"verbose_name": "Участник", "verbose_name_plural": "Участники", "ordering": ["last_name", "first_name"]},
        ),
        migrations.CreateModel(
            name="TrainingParticipation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("attended", models.BooleanField(default=True)),
                ("completion_date", models.DateField(blank=True, null=True)),
                ("notes", models.TextField(blank=True)),
                ("trainee", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="participations", to="trainees.trainee",
                )),
                ("training", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="participations", to="trainings.training",
                )),
            ],
            options={
                "verbose_name": "Участие в тренинге",
                "verbose_name_plural": "Участия в тренингах",
                "ordering": ["-training__date"],
            },
        ),
        migrations.AlterUniqueTogether(
            name="trainingparticipation",
            unique_together={("trainee", "training")},
        ),
    ]
