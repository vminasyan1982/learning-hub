from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0002_add_mandatory_budget"),
    ]

    operations = [
        migrations.AlterField(
            model_name="budgetplan",
            name="currency",
            field=models.CharField(
                choices=[("USD", "USD ($)"), ("EUR", "EUR (€)"), ("RUB", "RUB (₽)"), ("AMD", "AMD")],
                default="USD",
                max_length=10,
                verbose_name="Валюта",
            ),
        ),
    ]
