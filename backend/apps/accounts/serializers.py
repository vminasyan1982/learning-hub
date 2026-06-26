from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User, InvitationToken, RegistrationRequest, UserRole


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "role", "department", "business_unit", "position", "phone",
                  "is_active", "date_joined", "must_change_password"]
        read_only_fields = ["id", "date_joined", "must_change_password"]


class MeSerializer(serializers.ModelSerializer):
    """Safe serializer for /auth/me/ — role and is_active are always read-only."""
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "role", "department", "business_unit", "position", "phone",
                  "is_active", "date_joined", "must_change_password"]
        read_only_fields = ["id", "username", "role", "is_active",
                            "date_joined", "must_change_password"]


class UserBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email", "role"]


class InvitationTokenSerializer(serializers.ModelSerializer):
    invite_url = serializers.SerializerMethodField()
    created_by = UserBriefSerializer(read_only=True)

    class Meta:
        model = InvitationToken
        fields = ["id", "token", "note", "is_used", "is_valid", "expires_at",
                  "created_by", "created_at", "invite_url"]
        read_only_fields = ["id", "token", "is_used", "expires_at", "created_at"]

    def get_invite_url(self, obj):
        request = self.context.get("request")
        if request:
            return f"{request.scheme}://{request.get_host()}/register?token={obj.token}"
        return f"/register?token={obj.token}"


class RegistrationRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationRequest
        fields = [
            "id", "first_name", "last_name", "email", "phone",
            "position", "department", "business_unit", "requested_role",
            "status", "denial_reason", "created_at",
        ]
        read_only_fields = ["id", "status", "denial_reason", "created_at"]


class RegistrationSubmitSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=30, required=False, allow_blank=True)
    position = serializers.CharField(max_length=255)
    department = serializers.CharField(max_length=255)
    business_unit = serializers.CharField(max_length=255)
    requested_role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.VIEWER)

    def validate_token(self, value):
        try:
            token = InvitationToken.objects.get(token=value)
        except InvitationToken.DoesNotExist:
            raise serializers.ValidationError("Ссылка для приглашения недействительна.")
        if not token.is_valid:
            raise serializers.ValidationError("Ссылка для приглашения истекла или уже использована.")
        return token

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с этим email уже зарегистрирован.")
        if RegistrationRequest.objects.filter(email=value).exists():
            raise serializers.ValidationError("Заявка с этим email уже существует.")
        return value


class ApproveRegistrationSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=UserRole.choices)


class DenyRegistrationSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data["new_password"] != data["new_password_confirm"]:
            raise serializers.ValidationError({"new_password_confirm": "Пароли не совпадают."})
        return data
