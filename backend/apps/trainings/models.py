from django.db import models


class TrainingFormat(models.TextChoices):
    ONLINE = "online", "Онлайн"
    OFFLINE = "offline", "Офлайн"
    MIXED = "mixed", "Смешанный"


class TrainingClassification(models.TextChoices):
    ONLINE_SELF = "online_self", "Онлайн самостоятельный курс"
    ONLINE_DEADLINE = "online_deadline", "Онлайн курс с дедлайном"
    ONLINE_MIXED = "online_mixed", "Онлайн смешанный (LMS/EX + воркшоп)"
    OFFLINE_MIXED = "offline_mixed", "Офлайн смешанный"
    ONLINE_TRAINER = "online_trainer", "Онлайн тренинг с тренером"
    OFFLINE_TRAINER = "offline_trainer", "Офлайн тренинг с тренером"
    ONLINE_WORKSHOP = "online_workshop", "Онлайн воркшоп с тренером"
    OFFLINE_WORKSHOP = "offline_workshop", "Офлайн воркшоп с тренером"
    ONLINE_GAME = "online_game", "Онлайн бизнес-игра с тренером"
    OFFLINE_GAME = "offline_game", "Офлайн бизнес-игра с тренером"
    ONLINE_STRATEGY = "online_strategy", "Онлайн стратегическая сессия"
    OFFLINE_STRATEGY = "offline_strategy", "Офлайн стратегическая сессия"
    ONLINE_COACHING = "online_coaching", "Онлайн коучинг"
    OFFLINE_COACHING = "offline_coaching", "Офлайн коучинг"
    ONLINE_MASTERCLASS = "online_masterclass", "Онлайн мастер-класс"
    OFFLINE_MASTERCLASS = "offline_masterclass", "Офлайн мастер-класс"
    ONLINE_CONFERENCE = "online_conference", "Онлайн конференция"
    OFFLINE_CONFERENCE = "offline_conference", "Офлайн конференция"
    ONLINE_TEAMBUILDING = "online_teambuilding", "Онлайн тимбилдинг"
    OFFLINE_TEAMBUILDING = "offline_teambuilding", "Офлайн тимбилдинг"


class BusinessUnit(models.Model):
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        verbose_name = "Бизнес-юнит"
        verbose_name_plural = "Бизнес-юниты"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Training(models.Model):
    title = models.CharField(max_length=500)
    date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=500, blank=True)
    format = models.CharField(max_length=20, choices=TrainingFormat.choices)
    classification = models.CharField(max_length=30, choices=TrainingClassification.choices)
    business_units = models.ManyToManyField(BusinessUnit, blank=True, related_name="trainings")
    description = models.TextField(blank=True)
    lms_url = models.URLField(blank=True)
    asana_url = models.URLField(blank=True)
    drive_url = models.URLField(blank=True)
    feedback_url = models.URLField(blank=True)
    is_internal = models.BooleanField(default=True, help_text="Внутренний / Внешний")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Тренинг"
        verbose_name_plural = "Тренинги"
        ordering = ["-date"]

    def __str__(self):
        return f"{self.title} ({self.date})"


class TrainingMetric(models.Model):
    training = models.OneToOneField(Training, on_delete=models.CASCADE, related_name="metric")
    nps_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    nps_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    csat_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    csat_percent = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    business_value = models.SmallIntegerField(
        null=True, blank=True,
        help_text="0=не применяется, 1=частично, 2=стабильно"
    )
    lh_standards_score = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    trainer_rating = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    discipline_ok = models.BooleanField(default=True, help_text="Нет официальных предупреждений")
    participants_count = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Метрика тренинга"
        verbose_name_plural = "Метрики тренингов"

    def __str__(self):
        return f"Метрика: {self.training.title}"
