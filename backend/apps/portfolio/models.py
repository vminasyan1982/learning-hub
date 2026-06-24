from django.db import models


CLASSIFICATION_CHOICES = [
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
]


class PortfolioItem(models.Model):
    promo_name = models.CharField(max_length=500, verbose_name="Промо-название")
    internal_name = models.CharField(max_length=500, verbose_name="Внутреннее название")
    category = models.CharField(max_length=100, blank=True, verbose_name="Категория")
    classification = models.CharField(
        max_length=30, blank=True,
        choices=CLASSIFICATION_CHOICES,
        verbose_name="Классификация",
    )
    banner = models.ImageField(upload_to="portfolio/banners/", null=True, blank=True, verbose_name="Баннер")
    skills = models.TextField(blank=True, verbose_name="Навыки")
    LANGUAGE_CHOICES = [("Русский", "Русский"), ("English", "English")]
    language = models.CharField(max_length=100, default="Русский", choices=LANGUAGE_CHOICES, verbose_name="Язык")
    enrollment_info = models.TextField(blank=True, verbose_name="Как записаться")
    description = models.TextField(blank=True, verbose_name="Описание курса")
    duration = models.CharField(max_length=100, blank=True, verbose_name="Продолжительность")
    lms_url = models.URLField(blank=True, verbose_name="Ссылка на курс (LMS)")
    participants_count = models.PositiveIntegerField(default=0, verbose_name="Кол-во участников")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Элемент портфолио"
        verbose_name_plural = "T&D Portfolio"
        ordering = ["order", "promo_name"]

    def __str__(self):
        return self.promo_name
