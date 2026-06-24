from django.db import models


class SupportMessage(models.Model):
    name = models.CharField(max_length=150, verbose_name="Имя")
    email = models.EmailField(blank=True, verbose_name="Email")
    message = models.TextField(verbose_name="Сообщение")
    is_read = models.BooleanField(default=False, verbose_name="Прочитано")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Обращение"
        verbose_name_plural = "Обращения в поддержку"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} — {self.created_at:%d.%m.%Y %H:%M}"
