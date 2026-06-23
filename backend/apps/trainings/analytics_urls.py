from django.urls import path
from .analytics_views import AnalyticsSummaryView, AnalyticsTrendsView, ComplianceView, BudgetView

urlpatterns = [
    path("summary/", AnalyticsSummaryView.as_view(), name="analytics-summary"),
    path("trends/", AnalyticsTrendsView.as_view(), name="analytics-trends"),
    path("compliance/", ComplianceView.as_view(), name="analytics-compliance"),
    path("budget/", BudgetView.as_view(), name="analytics-budget"),
]
