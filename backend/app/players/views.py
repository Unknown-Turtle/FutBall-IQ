from django.shortcuts import render
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Player, Position
from .serializers import PlayerSerializer, PositionSerializer

# Create your views here.

class PlayerViewSet(viewsets.ModelViewSet):
    """
    API endpoint for players
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['team', 'position', 'nationality']
    search_fields = ['first_name', 'last_name', 'full_name', 'nationality']
    ordering_fields = ['last_name', 'goals', 'assists', 'minutes_played', 'expected_goals']
    ordering = ['team', 'last_name']

class PositionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for player positions
    """
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    ordering = ['name']
