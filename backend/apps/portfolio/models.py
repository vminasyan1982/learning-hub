from django.db import models


class PortfolioItem(models.Model):
    promo_name = models.CharField(max_length=500, verbose_name="Промо-название")
    internal_name = models.CharField(max_length=500, verbose_name="Внутреннее название")
    category = models.CharField(max_length=100, blank=True, verbose_name="Категория")
    banner = models.ImageField(upload_to="portfolio/banners/", null=True, blank=True, verbose_name="Баннер")
    skills = models.TextField(blank=True, verbose_name="Навыки")
    language = models.CharField(max_length=100, default="Русский", verbose_name="Язык")
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
