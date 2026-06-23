from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trainings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="training",
            name="is_mandatory",
            field=models.BooleanField(default=False, help_text="Обязателен для прохождения всеми сотрудниками", verbose_name="Обязательный"),
        ),
        migrations.AddField(
            model_name="training",
            name="compliance_deadline",
            field=models.DateField(blank=True, null=True, verbose_name="Срок выполнения (обязательный)"),
        ),
        migrations.CreateModel(
            name="BudgetPlan",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("year", models.PositiveIntegerField(verbose_name="Год")),
                ("quarter", models.PositiveSmallIntegerField(blank=True, choices=[(1, "Q1"), (2, "Q2"), (3, "Q3"), (4, "Q4")], null=True, verbose_name="Квартал (пусто = весь год)")),
                ("business_unit", models.CharField(blank=True, max_length=255, verbose_name="Бизнес-юнит (пусто = все)")),
                ("category", models.CharField(choices=[("internal", "Internal T&D"), ("external", "External Training"), ("total", "Total L&D")], default="total", max_length=20, verbose_name="Категория")),
                ("planned_amount", models.DecimalField(decimal_places=2, max_digits=14, verbose_name="Плановый бюджет")),
                ("currency", models.CharField(default="AMD", max_length=10, verbose_name="Валюта")),
                ("notes", models.TextField(blank=True, verbose_name="Примечания")),
            ],
            options={
                "verbose_name": "Бюджетный план",
                "verbose_name_plural": "Бюджетные планы",
                "ordering": ["-year", "quarter", "business_unit"],
                "unique_together": {("year", "quarter", "business_unit", "category")},
            },
        ),
    ]
