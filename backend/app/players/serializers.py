from rest_framework import serializers
from .models import Player, Position
from teams.serializers import TeamSerializer

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name', 'short_name']

class PlayerSerializer(serializers.ModelSerializer):
    team_details = TeamSerializer(source='team', read_only=True)
    position_details = PositionSerializer(source='position', read_only=True)
    goals_per_90 = serializers.FloatField(read_only=True)
    assists_per_90 = serializers.FloatField(read_only=True)
    goal_contributions = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Player
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'slug', 'nationality',
            'date_of_birth', 'height', 'weight', 'preferred_foot', 'team', 'team_details',
            'jersey_number', 'position', 'position_details', 'appearances', 'minutes_played',
            'goals', 'assists', 'yellow_cards', 'red_cards', 'expected_goals',
            'expected_assists', 'shots', 'shots_on_target', 'key_passes',
            'pass_completion', 'tackles', 'interceptions', 'fbref_id', 'image',
            'goals_per_90', 'assists_per_90', 'goal_contributions', 'created_at', 'updated_at'
        ]
        read_only_fields = ['full_name', 'slug', 'created_at', 'updated_at'] 