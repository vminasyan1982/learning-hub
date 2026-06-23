from django.urls import path
from .views import SkillListView, SkillsMatrixView

urlpatterns = [
    path("", SkillListView.as_view(), name="skills-list"),
    path("matrix/", SkillsMatrixView.as_view(), name="skills-matrix"),
]
