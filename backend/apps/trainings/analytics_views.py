from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Avg, Count
from django.db.models.functions import TruncQuarter, TruncMonth
from .models import Training, TrainingMetric, BusinessUnit, BudgetPlan
from apps.trainees.models import TrainingParticipation
from apps.trainers.models import Trainer
from apps.registry.models import InternalRegistryEntry, RegistryStatus


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
            avg_nps_pct=Avg("nps_percent"),
            avg_csat=Avg("csat_score"),
            avg_csat_pct=Avg("csat_percent"),
            avg_lh_standards=Avg("lh_standards_score"),
            avg_trainer_rating=Avg("trainer_rating"),
        )

        total_trainings = trainings.count()
        total_metrics = metrics.count()
        total_participants = TrainingParticipation.objects.filter(
            training__in=trainings, attended=True
        ).count()

        format_counts = {
            row["format"]: row["c"]
            for row in trainings.values("format").annotate(c=Count("id"))
        }

        total_trainers = Trainer.objects.filter(is_active=True).count()
        internal_trainers = Trainer.objects.filter(is_active=True, is_internal=True).count()

        nps_target_met = metrics.filter(nps_score__gte=3.0).count()
        csat_target_met = metrics.filter(csat_score__gte=4.3).count()
        trainer_rating_met = metrics.filter(trainer_rating__gte=4.5).count()

        bv_total = metrics.exclude(business_value__isnull=True).count()
        bv_compliant = metrics.filter(business_value__gte=1).count()
        business_value_pct = round(bv_compliant / bv_total * 100) if bv_total else 0

        projects_in_progress = InternalRegistryEntry.objects.filter(
            status__in=[RegistryStatus.IN_PROGRESS, RegistryStatus.AT_RISK, RegistryStatus.NOT_STARTED]
        ).count()

        bu_breakdown = list(
            BusinessUnit.objects
            .filter(trainings__in=trainings)
            .annotate(project_count=Count("trainings", distinct=True))
            .values("name", "project_count")
            .order_by("-project_count")
        )

        data = {
            "total_trainings": total_trainings,
            "online_count": format_counts.get("online", 0),
            "offline_count": format_counts.get("offline", 0),
            "mixed_count": format_counts.get("mixed", 0),
            "avg_nps": round(float(agg["avg_nps"] or 0), 2),
            "avg_nps_pct": round(float(agg["avg_nps_pct"] or 0), 1),
            "nps_target_met": nps_target_met,
            "avg_csat": round(float(agg["avg_csat"] or 0), 2),
            "avg_csat_pct": round(float(agg["avg_csat_pct"] or 0), 1),
            "csat_target_met": csat_target_met,
            "avg_lh_standards": round(float(agg["avg_lh_standards"] or 0), 2),
            "avg_trainer_rating": round(float(agg["avg_trainer_rating"] or 0), 2),
            "trainer_rating_met": trainer_rating_met,
            "total_participants": total_participants,
            "avg_participants_per_training": round(total_participants / total_trainings, 1) if total_trainings else 0,
            "total_trainers": total_trainers,
            "internal_trainers": internal_trainers,
            "external_trainers": total_trainers - internal_trainers,
            "total_metrics": total_metrics,
            "business_value_pct": business_value_pct,
            "projects_in_progress": projects_in_progress,
            "bu_breakdown": bu_breakdown,
        }
        return Response(data)


class AnalyticsTrendsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        granularity = request.query_params.get("granularity", "month")
        year = request.query_params.get("year")
        trunc_fn = TruncQuarter if granularity == "quarter" else TruncMonth

        qs = TrainingMetric.objects
        if year:
            qs = qs.filter(training__date__year=year)

        qs = qs.annotate(period=trunc_fn("training__date")).values("period").annotate(
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


class ComplianceView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.trainees.models import Trainee, TrainingParticipation

        mandatory = Training.objects.filter(is_mandatory=True)
        total_mandatory = mandatory.count()

        if total_mandatory == 0:
            return Response({
                "total_mandatory": 0,
                "overall_compliance_pct": 0,
                "trainings": [],
            })

        total_trainees = Trainee.objects.filter(is_active=True).count()

        trainings_data = []
        for t in mandatory:
            completed = TrainingParticipation.objects.filter(
                training=t, attended=True
            ).count()
            pct = round(completed / total_trainees * 100) if total_trainees else 0
            trainings_data.append({
                "id": t.id,
                "title": t.title,
                "deadline": str(t.compliance_deadline) if t.compliance_deadline else None,
                "completed": completed,
                "total": total_trainees,
                "compliance_pct": pct,
                "status": "green" if pct >= 90 else "yellow" if pct >= 70 else "red",
            })

        overall = round(sum(d["compliance_pct"] for d in trainings_data) / total_mandatory) if total_mandatory else 0

        return Response({
            "total_mandatory": total_mandatory,
            "overall_compliance_pct": overall,
            "total_trainees": total_trainees,
            "trainings": trainings_data,
        })


class BudgetView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.registry.models import ExternalRegistryEntry
        from django.db.models import Sum
        import datetime

        year = request.query_params.get("year", str(datetime.date.today().year))

        plans = BudgetPlan.objects.filter(year=year)
        total_planned = float(plans.aggregate(s=Sum("planned_amount"))["s"] or 0)

        actual_external = float(
            ExternalRegistryEntry.objects.filter(
                date__year=year
            ).aggregate(s=Sum("cost"))["s"] or 0
        )

        by_quarter = []
        for q in range(1, 5):
            q_planned = float(plans.filter(quarter=q).aggregate(s=Sum("planned_amount"))["s"] or 0)
            by_quarter.append({"quarter": f"Q{q}", "planned": q_planned, "actual": 0})

        return Response({
            "year": year,
            "total_planned": total_planned,
            "total_actual": actual_external,
            "variance": total_planned - actual_external,
            "by_quarter": by_quarter,
        })


class ROIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from apps.registry.models import ExternalRegistryEntry
        from django.db.models import Sum, Count, Avg

        year = request.query_params.get("year")

        # Training metrics
        metrics_qs = TrainingMetric.objects.all()
        trainings_qs = Training.objects.all()
        if year:
            metrics_qs = metrics_qs.filter(training__date__year=year)
            trainings_qs = trainings_qs.filter(date__year=year)

        total_participants = metrics_qs.aggregate(s=Sum("participants_count"))["s"] or 0
        total_trainings = trainings_qs.count()
        avg_nps = float(metrics_qs.aggregate(a=Avg("nps_score"))["a"] or 0)
        avg_csat = float(metrics_qs.aggregate(a=Avg("csat_score"))["a"] or 0)

        # Costs from external registry
        ext_qs = ExternalRegistryEntry.objects.all()
        if year:
            ext_qs = ext_qs.filter(date__year=year)
        total_cost = float(ext_qs.aggregate(s=Sum("cost"))["s"] or 0)

        cost_per_participant = round(total_cost / total_participants, 2) if total_participants else 0

        return Response({
            "year": year or "all",
            "total_cost": total_cost,
            "total_participants": total_participants,
            "total_trainings": total_trainings,
            "cost_per_participant": cost_per_participant,
            "avg_nps": round(avg_nps, 2),
            "avg_csat": round(avg_csat, 2),
            "nps_benchmark": 3.0,
            "csat_benchmark": 4.3,
        })
