from django.db import models


class PortfolioItem(models.Model):
    promo_name = models.CharField(max_length=500, verbose_name="Промо-название")
    internal_name = models.CharField(max_length=500, verbose_name="Внутреннее название")
    banner = models.ImageField(upload_to="portfolio/banners/", null=True, blank=True, verbose_name="Баннер")
    skills = models.TextField(blank=True, verbose_name="Навыки")
    language = models.CharField(max_length=100, default="Русский", verbose_name="Язык")
    enrollment_info = models.TextField(blank=True, verbose_name="Как записаться")
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
