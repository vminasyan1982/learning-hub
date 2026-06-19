from django.db import models
from apps.trainings.models import Training


class Trainee(models.Model):
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField(blank=True)
    position = models.CharField(max_length=255, blank=True)
    department = models.CharField(max_length=255, blank=True)
    business_unit = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Участник"
        verbose_name_plural = "Участники"
        ordering = ["last_name", "first_name"]

    def __str__(self):
        return f"{self.last_name} {self.first_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class TrainingParticipation(models.Model):
    trainee = models.ForeignKey(Trainee, on_delete=models.CASCADE, related_name="participations")
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name="participations")
    attended = models.BooleanField(default=True)
    completion_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Участие в тренинге"
        verbose_name_plural = "Участия в тренингах"
        unique_together = [["trainee", "training"]]
        ordering = ["-training__date"]

    def __str__(self):
        status = "✓" if self.attended else "✗"
        return f"{self.trainee} → {self.training.title} {status}"
