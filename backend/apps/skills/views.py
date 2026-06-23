from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.accounts.models import User
from .models import Skill, EmployeeSkill
from .serializers import SkillSerializer


class SkillListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SkillSerializer
    queryset = Skill.objects.filter(is_active=True)


class SkillsMatrixView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = Skill.objects.filter(is_active=True).order_by("order", "name")
        employees = User.objects.filter(is_active=True).order_by("last_name", "first_name")

        skills_data = [
            {"id": s.id, "name": s.name, "category": s.category}
            for s in skills
        ]

        employees_data = []
        for emp in employees:
            assessments = EmployeeSkill.objects.filter(employee=emp).values("skill_id", "level")
            skill_levels = {str(a["skill_id"]): a["level"] for a in assessments}

            full_name = emp.get_full_name() or emp.username
            employees_data.append({
                "id": emp.id,
                "name": full_name,
                "department": emp.department,
                "skill_levels": skill_levels,
            })

        return Response({
            "skills": skills_data,
            "employees": employees_data,
        })
