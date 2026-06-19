from django.urls import path
from .analytics_views import AnalyticsSummaryView, AnalyticsTrendsView

urlpatterns = [
    path("summary/", AnalyticsSummaryView.as_view(), name="analytics-summary"),
    path("trends/", AnalyticsTrendsView.as_view(), name="analytics-trends"),
]
