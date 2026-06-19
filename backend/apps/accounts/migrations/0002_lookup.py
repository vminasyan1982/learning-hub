from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Lookup",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("category", models.CharField(
                    choices=[("department", "Отдел"), ("position", "Должность"), ("business_unit", "Бизнес-юнит")],
                    max_length=50,
                )),
                ("name", models.CharField(max_length=255)),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_active", models.BooleanField(default=True)),
            ],
            options={
                "verbose_name": "Справочник",
                "verbose_name_plural": "Справочники",
                "ordering": ["category", "order", "name"],
            },
        ),
        migrations.AlterUniqueTogether(
            name="lookup",
            unique_together={("category", "name")},
        ),
    ]
