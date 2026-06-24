from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import SupportMessage
from .serializers import SupportMessageSerializer


class SupportMessageCreateView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = SupportMessageSerializer
    queryset = SupportMessage.objects.all()
