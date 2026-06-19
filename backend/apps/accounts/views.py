import secrets
import string
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator

from .models import User, InvitationToken, RegistrationRequest, RegistrationStatus
from .serializers import (
    UserSerializer, InvitationTokenSerializer, RegistrationRequestSerializer,
    RegistrationSubmitSerializer, ApproveRegistrationSerializer, DenyRegistrationSerializer,
    ChangePasswordSerializer,
)
from .email import send_registration_received, send_registration_approved, send_registration_denied
from .permissions import IsAdminRole


def _generate_temp_password(length=16):
    alphabet = string.ascii_letters + string.digits + "!@#$%"
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _make_username(first_name, last_name, email):
    base = email.split("@")[0].lower().replace(".", "_")
    if not User.objects.filter(username=base).exists():
        return base
    counter = 1
    while User.objects.filter(username=f"{base}{counter}").exists():
        counter += 1
    return f"{base}{counter}"


# ── Registration flow ─────────────────────────────────────────────────────────

class ValidateTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token_value = request.query_params.get("token")
        if not token_value:
            return Response({"error": "Параметр token обязателен."}, status=400)
        try:
            token = InvitationToken.objects.get(token=token_value)
        except (InvitationToken.DoesNotExist, Exception):
            return Response({"valid": False, "error": "Токен не найден."}, status=404)
        if not token.is_valid:
            return Response({"valid": False, "error": "Токен истёк или уже использован."}, status=400)
        return Response({"valid": True})


@method_decorator(ratelimit(key="ip", rate="5/h", method="POST", block=True), name="post")
class RegistrationSubmitView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegistrationSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        data = serializer.validated_data
        invitation = data["token"]  # already resolved to InvitationToken object

        reg = RegistrationRequest.objects.create(
            invitation=invitation,
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            phone=data.get("phone", ""),
            position=data["position"],
            department=data["department"],
            business_unit=data["business_unit"],
            requested_role=data.get("requested_role", "viewer"),
        )
        invitation.is_used = True
        invitation.save(update_fields=["is_used"])

        send_registration_received(reg)

        return Response(
            {"message": "Заявка отправлена. Администратор рассмотрит её в ближайшее время."},
            status=201,
        )


# ── Admin: manage registrations ───────────────────────────────────────────────

class RegistrationRequestListView(generics.ListAPIView):
    serializer_class = RegistrationRequestSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ["status"]

    def get_queryset(self):
        return RegistrationRequest.objects.select_related("invitation", "reviewed_by").all()


class ApproveRegistrationView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            reg = RegistrationRequest.objects.get(pk=pk, status=RegistrationStatus.PENDING)
        except RegistrationRequest.DoesNotExist:
            return Response({"error": "Заявка не найдена или уже рассмотрена."}, status=404)

        serializer = ApproveRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        temp_password = _generate_temp_password()
        username = _make_username(reg.first_name, reg.last_name, reg.email)

        user = User.objects.create(
            username=username,
            email=reg.email,
            first_name=reg.first_name,
            last_name=reg.last_name,
            role=serializer.validated_data["role"],
            department=reg.department,
            business_unit=reg.business_unit,
            position=reg.position,
            phone=reg.phone,
            password=make_password(temp_password),
            must_change_password=True,
        )

        reg.status = RegistrationStatus.APPROVED
        reg.reviewed_by = request.user
        reg.reviewed_at = timezone.now()
        reg.created_user = user
        reg.save(update_fields=["status", "reviewed_by", "reviewed_at", "created_user"])

        send_registration_approved(user, temp_password)

        return Response({"message": f"Пользователь {user.username} создан. Уведомление отправлено."})


class DenyRegistrationView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request, pk):
        try:
            reg = RegistrationRequest.objects.get(pk=pk, status=RegistrationStatus.PENDING)
        except RegistrationRequest.DoesNotExist:
            return Response({"error": "Заявка не найдена или уже рассмотрена."}, status=404)

        serializer = DenyRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        reg.status = RegistrationStatus.DENIED
        reg.denial_reason = serializer.validated_data.get("reason", "")
        reg.reviewed_by = request.user
        reg.reviewed_at = timezone.now()
        reg.save(update_fields=["status", "denial_reason", "reviewed_by", "reviewed_at"])

        send_registration_denied(reg)

        return Response({"message": "Заявка отклонена. Пользователь уведомлён."})


# ── Invitation management ─────────────────────────────────────────────────────

class InvitationListCreateView(generics.ListCreateAPIView):
    serializer_class = InvitationTokenSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return InvitationToken.objects.select_related("created_by").all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# ── Users ─────────────────────────────────────────────────────────────────────

class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]
    filterset_fields = ["role", "is_active"]
    search_fields = ["username", "email", "first_name", "last_name"]

    def get_queryset(self):
        return User.objects.all()


class UserDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]
    queryset = User.objects.all()


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        user = request.user
        if not user.check_password(serializer.validated_data["old_password"]):
            return Response({"old_password": "Неверный пароль."}, status=400)

        user.set_password(serializer.validated_data["new_password"])
        user.must_change_password = False
        user.save(update_fields=["password", "must_change_password"])
        return Response({"message": "Пароль успешно изменён."})
