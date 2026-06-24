from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolio", "0002_portfolio_detail_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="portfolioitem",
            name="category",
            field=models.CharField(blank=True, max_length=100, verbose_name="Категория"),
        ),
    ]
