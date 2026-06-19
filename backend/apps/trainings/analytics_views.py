from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Q
from django.db.models.functions import TruncQuarter, TruncMonth
from .models import Training, TrainingMetric
from apps.trainees.models import TrainingParticipation


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        metrics = TrainingMetric.objects.all()
        trainings = Training.objects.all()

        period = request.query_params.get("period")
        bu = request.query_params.get("business_unit")
        fmt = request.query_params.get("format")

        if period:
            trainings = trainings.filter(date__year=period)
            metrics = metrics.filter(training__date__year=period)
        if bu:
            trainings = trainings.filter(business_units__id=bu)
            metrics = metrics.filter(training__business_units__id=bu)
        if fmt:
            trainings = trainings.filter(format=fmt)
            metrics = metrics.filter(training__format=fmt)

        agg = metrics.aggregate(
            avg_nps=Avg("nps_score"),
            avg_csat=Avg("csat_score"),
            avg_lh_standards=Avg("lh_standards_score"),
            avg_trainer_rating=Avg("trainer_rating"),
            total_participants=Count("participants_count"),
        )

        data = {
            "total_trainings": trainings.count(),
            "avg_nps": round(float(agg["avg_nps"] or 0), 2),
            "avg_csat": round(float(agg["avg_csat"] or 0), 2),
            "avg_lh_standards": round(float(agg["avg_lh_standards"] or 0), 2),
            "avg_trainer_rating": round(float(agg["avg_trainer_rating"] or 0), 2),
            "total_participants": TrainingParticipation.objects.filter(
                training__in=trainings, attended=True
            ).count(),
        }
        return Response(data)


class AnalyticsTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        granularity = request.query_params.get("granularity", "month")
        trunc_fn = TruncQuarter if granularity == "quarter" else TruncMonth

        qs = TrainingMetric.objects.annotate(period=trunc_fn("training__date")).values("period").annotate(
            avg_nps=Avg("nps_score"),
            avg_csat=Avg("csat_score"),
            count=Count("id"),
        ).order_by("period")

        data = [
            {
                "period": item["period"].strftime("%Y-%m") if item["period"] else None,
                "avg_nps": round(float(item["avg_nps"] or 0), 2),
                "avg_csat": round(float(item["avg_csat"] or 0), 2),
                "count": item["count"],
            }
            for item in qs
            if item["period"]
        ]
        return Response(data)
