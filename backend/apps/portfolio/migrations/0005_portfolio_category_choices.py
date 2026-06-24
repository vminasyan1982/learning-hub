from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolio", "0004_portfolio_classification"),
    ]

    operations = [
        migrations.AlterField(
            model_name="portfolioitem",
            name="category",
            field=models.CharField(
                blank=True,
                choices=[
                    ("Leadership", "Leadership"),
                    ("Management", "Management"),
                    ("Sales", "Sales"),
                    ("Hard Skills", "Hard Skills"),
                    ("Soft Skills", "Soft Skills"),
                    ("Digital Tools", "Digital Tools"),
                    ("Compliance", "Compliance"),
                    ("Onboarding", "Onboarding"),
                    ("Coaching", "Coaching"),
                    ("Teambuilding", "Teambuilding"),
                    ("Strategy", "Strategy"),
                ],
                max_length=100,
                verbose_name="Категория",
            ),
        ),
    ]
