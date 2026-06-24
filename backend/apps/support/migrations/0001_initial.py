from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="SupportMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150, verbose_name="Имя")),
                ("email", models.EmailField(blank=True, max_length=254, verbose_name="Email")),
                ("message", models.TextField(verbose_name="Сообщение")),
                ("is_read", models.BooleanField(default=False, verbose_name="Прочитано")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={
                "verbose_name": "Обращение",
                "verbose_name_plural": "Обращения в поддержку",
                "ordering": ["-created_at"],
            },
        ),
    ]
