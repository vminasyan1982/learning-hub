from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0003_budgetplan_currency_choices"),
        ("trainers", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="training",
            name="trainers",
            field=models.ManyToManyField(
                blank=True,
                related_name="trainings",
                to="trainers.trainer",
                verbose_name="Тренеры",
            ),
        ),
    ]
