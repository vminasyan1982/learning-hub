from django.urls import path
from .views import DevelopmentPlanListView, DevelopmentPlanDetailView, DevelopmentGoalUpdateView

urlpatterns = [
    path("", DevelopmentPlanListView.as_view()),
    path("<int:pk>/", DevelopmentPlanDetailView.as_view()),
    path("goals/<int:pk>/", DevelopmentGoalUpdateView.as_view()),
]
