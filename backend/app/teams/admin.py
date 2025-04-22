from django.contrib import admin
from .models import Team

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'points', 'matches_played', 'wins', 'draws', 'losses']
    list_filter = ['position']
    search_fields = ['name', 'stadium', 'manager']
    prepopulated_fields = {'slug': ('name',)}
    ordering = ['position', 'name'] 