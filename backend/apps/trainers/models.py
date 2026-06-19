from django.db import models


class TrainerType(models.TextChoices):
    DEPARTMENT = "department", "Департаментские тренинги"
    SOFT_SKILLS = "soft_skills", "Soft Skills"
    STRATEGIC = "strategic", "Стратегические сессии"
    BUSINESS_GAME = "business_game", "Бизнес-игры"
    WORKSHOP = "workshop", "Воркшопы"
    TEAMBUILDING = "teambuilding", "Тимбилдинги"
    COACHING = "coaching", "Коучинг"
    MASTERCLASS = "masterclass", "Мастер-классы"


class Trainer(models.Model):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=30, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to="trainers/photos/", null=True, blank=True)
    trainer_types = models.JSONField(default=list, blank=True)
    is_internal = models.BooleanField(default=True, help_text="Внутренний / Внешний тренер")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Тренер"
        verbose_name_plural = "Тренеры"
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.last_name} {self.first_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class TrainerDocument(models.Model):
    trainer = models.ForeignKey(Trainer, on_delete=models.CASCADE, related_name="documents")
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="trainers/documents/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Документ тренера"
        verbose_name_plural = "Документы тренеров"

    def __str__(self):
        return f"{self.trainer}: {self.title}"
