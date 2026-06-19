from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count, Sum, Q
from django.db.models.functions import TruncQuarter, TruncMonth
from .models import Training, TrainingMetric
from apps.trainees.models import TrainingParticipation
from apps.trainers.models import Trainer


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
        )

        total_trainings = trainings.count()
        total_participants = TrainingParticipation.objects.filter(
            training__in=trainings, attended=True
        ).count()

        format_counts = {
            row["format"]: row["c"]
            for row in trainings.values("format").annotate(c=Count("id"))
        }
        total_trainers = Trainer.objects.filter(is_active=True).count()
        internal_trainers = Trainer.objects.filter(is_active=True, is_internal=True).count()
        external_trainers = total_trainers - internal_trainers

        avg_nps = round(float(agg["avg_nps"] or 0), 2)
        avg_csat = round(float(agg["avg_csat"] or 0), 2)
        nps_target_met = metrics.filter(nps_score__gte=3.0).count()
        csat_target_met = metrics.filter(csat_score__gte=4.3).count()
        trainer_rating_met = metrics.filter(trainer_rating__gte=4.5).count()
        total_metrics = metrics.count()

        data = {
            "total_trainings": total_trainings,
            "online_count": format_counts.get("online", 0),
            "offline_count": format_counts.get("offline", 0),
            "mixed_count": format_counts.get("mixed", 0),
            "avg_nps": avg_nps,
            "nps_target_met": nps_target_met,
            "avg_csat": avg_csat,
            "csat_target_met": csat_target_met,
            "avg_lh_standards": round(float(agg["avg_lh_standards"] or 0), 2),
            "avg_trainer_rating": round(float(agg["avg_trainer_rating"] or 0), 2),
            "trainer_rating_met": trainer_rating_met,
            "total_participants": total_participants,
            "avg_participants_per_training": round(total_participants / total_trainings, 1) if total_trainings else 0,
            "total_trainers": total_trainers,
            "internal_trainers": internal_trainers,
            "external_trainers": external_trainers,
            "total_metrics": total_metrics,
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
