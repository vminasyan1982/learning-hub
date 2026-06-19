from django.urls import path
from .views import TrainingListCreateView, TrainingDetailView, BusinessUnitListCreateView

urlpatterns = [
    path("", TrainingListCreateView.as_view(), name="training-list"),
    path("<int:pk>/", TrainingDetailView.as_view(), name="training-detail"),
    path("business-units/", BusinessUnitListCreateView.as_view(), name="businessunit-list"),
]
