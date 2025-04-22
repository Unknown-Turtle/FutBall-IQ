from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import Team
from .serializers import TeamSerializer

class TeamFilter(filters.FilterSet):
    min_points = filters.NumberFilter(field_name="points", lookup_expr='gte')
    max_points = filters.NumberFilter(field_name="points", lookup_expr='lte')
    position_range = filters.RangeFilter(field_name="position")

    class Meta:
        model = Team
        fields = ['position', 'min_points', 'max_points']

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    filterset_class = TeamFilter
    lookup_field = 'slug'
    search_fields = ['name', 'stadium', 'manager']
    ordering_fields = ['position', 'points', 'wins', 'goals_for', 'name']
    ordering = ['position']

    @action(detail=True)
    def stats(self, request, slug=None):
        team = self.get_object()
        data = {
            'matches_played': team.matches_played,
            'wins': team.wins,
            'draws': team.draws,
            'losses': team.losses,
            'goals_for': team.goals_for,
            'goals_against': team.goals_against,
            'points': team.points,
            'position': team.position,
            'goal_difference': team.goal_difference,
            'win_percentage': team.win_percentage,
        }
        return Response(data) 