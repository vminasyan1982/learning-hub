from django.urls import path, include

urlpatterns = [
    path("auth/", include("apps.accounts.auth_urls")),
    path("register/", include("apps.accounts.register_urls")),
    path("users/", include("apps.accounts.user_urls")),
    path("trainings/", include("apps.trainings.urls")),
    path("registry/", include("apps.registry.urls")),
    path("trainers/", include("apps.trainers.urls")),
    path("trainees/", include("apps.trainees.urls")),
    path("portfolio/", include("apps.portfolio.urls")),
    path("analytics/", include("apps.trainings.analytics_urls")),
    path("admin-panel/", include("apps.accounts.admin_urls")),
    path("skills/", include("apps.skills.urls")),
    path("idp/", include("apps.idp.urls")),
    path("support/", include("apps.support.urls")),
]
