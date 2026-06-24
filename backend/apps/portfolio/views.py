from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from apps.accounts.permissions import IsTDTeamOrAdmin
from .models import PortfolioItem
from .serializers import PortfolioItemSerializer


class PortfolioListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = PortfolioItemSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["promo_name", "internal_name"]
    filterset_fields = ["category", "language"]
    ordering_fields = ["order", "promo_name"]
    ordering = ["order"]
    queryset = PortfolioItem.objects.filter(is_active=True)


class PortfolioDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTDTeamOrAdmin]
    serializer_class = PortfolioItemSerializer
    queryset = PortfolioItem.objects.all()
