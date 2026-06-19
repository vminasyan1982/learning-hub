from django.urls import path
from .views import TraineeListCreateView, TraineeDetailView, ParticipationListCreateView

urlpatterns = [
    path("", TraineeListCreateView.as_view(), name="trainee-list"),
    path("<int:pk>/", TraineeDetailView.as_view(), name="trainee-detail"),
    path("participations/", ParticipationListCreateView.as_view(), name="participation-list"),
]
