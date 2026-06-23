from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolio", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="portfolioitem",
            name="description",
            field=models.TextField(blank=True, verbose_name="Описание курса"),
        ),
        migrations.AddField(
            model_name="portfolioitem",
            name="duration",
            field=models.CharField(blank=True, max_length=100, verbose_name="Продолжительность"),
        ),
        migrations.AddField(
            model_name="portfolioitem",
            name="lms_url",
            field=models.URLField(blank=True, verbose_name="Ссылка на курс (LMS)"),
        ),
        migrations.AddField(
            model_name="portfolioitem",
            name="participants_count",
            field=models.PositiveIntegerField(default=0, verbose_name="Кол-во участников"),
        ),
    ]
