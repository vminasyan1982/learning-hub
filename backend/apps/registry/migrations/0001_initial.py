from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="InternalRegistryEntry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("request_date", models.DateField(verbose_name="Дата получения")),
                ("center", models.CharField(
                    choices=[("td","T&D"),("assessment","Ассессмент-центр")],
                    max_length=20, verbose_name="Центр",
                )),
                ("format", models.CharField(blank=True, max_length=100, verbose_name="Формат")),
                ("title", models.CharField(max_length=500, verbose_name="Название запроса")),
                ("asana_url", models.URLField(blank=True, verbose_name="Ссылка Asana")),
                ("project_manager", models.CharField(blank=True, max_length=255, verbose_name="Руководитель проекта")),
                ("developers", models.TextField(blank=True, verbose_name="Разработчики / ответственные")),
                ("deadline", models.DateField(blank=True, null=True, verbose_name="Срок")),
                ("status", models.CharField(
                    choices=[
                        ("not_started","Не начат"),("in_progress","В работе"),("on_hold","На паузе"),
                        ("completed","Завершён"),("at_risk","Под риском"),("cancelled","Отменён"),("done","Выполнен"),
                    ],
                    default="not_started", max_length=20, verbose_name="Статус",
                )),
                ("completed_on_time", models.BooleanField(blank=True, null=True, verbose_name="Выполнено в срок")),
                ("materials_url", models.URLField(blank=True, verbose_name="Материалы (Google Drive)")),
                ("comments", models.TextField(blank=True, verbose_name="Комментарии")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={"verbose_name": "Запись Internal Registry", "verbose_name_plural": "Internal Registry", "ordering": ["-request_date"]},
        ),
        migrations.CreateModel(
            name="ExternalRegistryEntry",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=500)),
                ("provider", models.CharField(blank=True, max_length=255)),
                ("date", models.DateField(blank=True, null=True)),
                ("cost", models.DecimalField(blank=True, decimal_places=2, max_digits=12, null=True)),
                ("currency", models.CharField(default="AMD", max_length=10)),
                ("notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
            ],
            options={"verbose_name": "Запись External Registry", "verbose_name_plural": "External Registry", "ordering": ["-date"]},
        ),
    ]
