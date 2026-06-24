from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("portfolio", "0003_portfolio_category"),
    ]

    operations = [
        migrations.AddField(
            model_name="portfolioitem",
            name="classification",
            field=models.CharField(
                blank=True,
                choices=[
                    ("online_self", "Онлайн самостоятельный курс"),
                    ("online_deadline", "Онлайн курс с дедлайном"),
                    ("online_mixed", "Онлайн смешанный (LMS/EX + воркшоп)"),
                    ("offline_mixed", "Офлайн смешанный"),
                    ("online_trainer", "Онлайн тренинг с тренером"),
                    ("offline_trainer", "Офлайн тренинг с тренером"),
                    ("online_workshop", "Онлайн воркшоп с тренером"),
                    ("offline_workshop", "Офлайн воркшоп с тренером"),
                    ("online_game", "Онлайн бизнес-игра с тренером"),
                    ("offline_game", "Офлайн бизнес-игра с тренером"),
                    ("online_strategy", "Онлайн стратегическая сессия"),
                    ("offline_strategy", "Офлайн стратегическая сессия"),
                    ("online_coaching", "Онлайн коучинг"),
                    ("offline_coaching", "Офлайн коучинг"),
                    ("online_masterclass", "Онлайн мастер-класс"),
                    ("offline_masterclass", "Офлайн мастер-класс"),
                    ("online_conference", "Онлайн конференция"),
                    ("offline_conference", "Офлайн конференция"),
                    ("online_teambuilding", "Онлайн тимбилдинг"),
                    ("offline_teambuilding", "Офлайн тимбилдинг"),
                ],
                max_length=30,
                verbose_name="Классификация",
            ),
        ),
    ]
