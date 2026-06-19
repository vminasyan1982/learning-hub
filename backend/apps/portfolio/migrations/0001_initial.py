from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="PortfolioItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("promo_name", models.CharField(max_length=500, verbose_name="Промо-название")),
                ("internal_name", models.CharField(max_length=500, verbose_name="Внутреннее название")),
                ("banner", models.ImageField(blank=True, null=True, upload_to="portfolio/banners/", verbose_name="Баннер")),
                ("skills", models.TextField(blank=True, verbose_name="Навыки")),
                ("language", models.CharField(default="Русский", max_length=100, verbose_name="Язык")),
                ("enrollment_info", models.TextField(blank=True, verbose_name="Как записаться")),
                ("is_active", models.BooleanField(default=True)),
                ("order", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"verbose_name": "Элемент портфолио", "verbose_name_plural": "T&D Portfolio", "ordering": ["order", "promo_name"]},
        ),
    ]
