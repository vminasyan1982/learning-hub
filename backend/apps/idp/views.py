from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import UserRole
from .models import DevelopmentPlan, DevelopmentGoal
from .serializers import DevelopmentPlanSerializer, DevelopmentGoalSerializer


class DevelopmentPlanListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DevelopmentPlanSerializer

    def get_queryset(self):
        user = self.request.user
        # Admins and managers can see all plans; others see only their own
        if user.role in (UserRole.ADMIN, UserRole.MANAGER, UserRole.TD_TEAM):
            qs = DevelopmentPlan.objects.all()
            employee_id = self.request.query_params.get("employee")
            if employee_id:
                qs = qs.filter(employee_id=employee_id)
            return qs.select_related("employee").prefetch_related("goals")
        return (
            DevelopmentPlan.objects.filter(employee=user)
            .select_related("employee")
            .prefetch_related("goals")
        )


class DevelopmentPlanDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DevelopmentPlanSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in (UserRole.ADMIN, UserRole.MANAGER, UserRole.TD_TEAM):
            return DevelopmentPlan.objects.select_related("employee").prefetch_related("goals")
        return DevelopmentPlan.objects.filter(employee=user).select_related("employee").prefetch_related("goals")


class DevelopmentGoalUpdateView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DevelopmentGoalSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role in (UserRole.ADMIN, UserRole.MANAGER, UserRole.TD_TEAM):
            return DevelopmentGoal.objects.select_related("plan__employee")
        return DevelopmentGoal.objects.filter(plan__employee=user).select_related("plan__employee")
