from rest_framework import serializers
from .models import Team

class TeamSerializer(serializers.ModelSerializer):
    goal_difference = serializers.IntegerField(read_only=True)
    win_percentage = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'slug', 'logo', 'founded_year', 'stadium', 'manager',
            'matches_played', 'wins', 'draws', 'losses', 'goals_for', 'goals_against',
            'points', 'position', 'goal_difference', 'win_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at'] 