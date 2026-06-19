from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags


def send_registration_received(registration_request):
    """Notify admin that a new registration request arrived."""
    subject = f"[Learning Hub] Новая заявка на регистрацию: {registration_request.first_name} {registration_request.last_name}"
    body = (
        f"Поступила новая заявка на доступ к Learning Hub.\n\n"
        f"Имя: {registration_request.first_name} {registration_request.last_name}\n"
        f"Email: {registration_request.email}\n"
        f"Должность: {registration_request.position}\n"
        f"Отдел: {registration_request.department}\n"
        f"Бизнес-юнит: {registration_request.business_unit}\n"
        f"Запрашиваемая роль: {registration_request.get_requested_role_display()}\n\n"
        f"Перейдите в панель управления для рассмотрения заявки.\n"
    )
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.ADMIN_EMAIL],
        fail_silently=True,
    )


def send_registration_approved(user, temp_password):
    """Notify user that their request was approved and send temp password."""
    subject = "[Learning Hub] Ваш доступ одобрен"
    body = (
        f"Уважаемый(-ая) {user.first_name} {user.last_name},\n\n"
        f"Ваш запрос на доступ к Learning Hub одобрен.\n\n"
        f"Ваши данные для входа:\n"
        f"  Логин: {user.username}\n"
        f"  Временный пароль: {temp_password}\n\n"
        f"При первом входе вас попросят сменить пароль.\n\n"
        f"Ссылка для входа: https://185.157.245.247/login\n\n"
        f"С уважением,\nКоманда Learning Hub"
    )
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=True,
    )


def send_registration_denied(registration_request):
    """Notify user that their request was denied."""
    subject = "[Learning Hub] Запрос на доступ отклонён"
    reason_text = ""
    if registration_request.denial_reason:
        reason_text = f"\nПричина: {registration_request.denial_reason}\n"
    body = (
        f"Уважаемый(-ая) {registration_request.first_name} {registration_request.last_name},\n\n"
        f"К сожалению, ваш запрос на доступ к Learning Hub был отклонён.{reason_text}\n"
        f"Если у вас есть вопросы, обратитесь к администратору.\n\n"
        f"С уважением,\nКоманда Learning Hub"
    )
    send_mail(
        subject=subject,
        message=body,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[registration_request.email],
        fail_silently=True,
    )
