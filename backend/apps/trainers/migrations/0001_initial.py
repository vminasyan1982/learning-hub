from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Trainer",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("first_name", models.CharField(max_length=150)),
                ("last_name", models.CharField(max_length=150)),
                ("email", models.EmailField(blank=True)),
                ("phone", models.CharField(blank=True, max_length=30)),
                ("bio", models.TextField(blank=True)),
                ("photo", models.ImageField(blank=True, null=True, upload_to="trainers/photos/")),
                ("trainer_types", models.JSONField(blank=True, default=list)),
                ("is_internal", models.BooleanField(default=True)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"verbose_name": "Тренер", "verbose_name_plural": "Тренеры", "ordering": ["last_name", "first_name"]},
        ),
        migrations.CreateModel(
            name="TrainerDocument",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=255)),
                ("file", models.FileField(upload_to="trainers/documents/")),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                ("trainer", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="documents", to="trainers.trainer",
                )),
            ],
            options={"verbose_name": "Документ тренера", "verbose_name_plural": "Документы тренеров"},
        ),
    ]
