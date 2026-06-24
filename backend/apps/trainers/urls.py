from django.urls import path
from .views import TrainerListCreateView, TrainerDetailView, TrainerDocumentCreateView, TrainerProfileView

urlpatterns = [
    path("", TrainerListCreateView.as_view(), name="trainer-list"),
    path("<int:pk>/", TrainerDetailView.as_view(), name="trainer-detail"),
    path("<int:pk>/profile/", TrainerProfileView.as_view(), name="trainer-profile"),
    path("<int:trainer_pk>/documents/", TrainerDocumentCreateView.as_view(), name="trainer-document-upload"),
]
