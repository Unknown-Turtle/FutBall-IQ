from django.contrib import admin
from .models import Team, Match, Analysis, AnalysisMetric

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')
    search_fields = ('name',)

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('home_team', 'away_team', 'match_date', 'match_type')
    list_filter = ('match_type', 'match_date')
    search_fields = ('home_team__name', 'away_team__name')
    date_hierarchy = 'match_date'

@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ('match', 'analyst', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('match__home_team__name', 'match__away_team__name', 'analyst__username')
    date_hierarchy = 'created_at'

@admin.register(AnalysisMetric)
class AnalysisMetricAdmin(admin.ModelAdmin):
    list_display = ('analysis', 'metric_type', 'team', 'timestamp', 'created_at')
    list_filter = ('metric_type', 'created_at')
    search_fields = ('analysis__match__home_team__name', 'analysis__match__away_team__name')
    date_hierarchy = 'created_at'
