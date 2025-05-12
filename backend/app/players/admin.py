from django.contrib import admin
from .models import Player, Position

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('name', 'short_name')
    search_fields = ('name', 'short_name')

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'team', 'position', 'nationality', 'appearances', 'goals', 'assists')
    list_filter = ('team', 'position', 'nationality')
    search_fields = ('first_name', 'last_name', 'full_name', 'nationality')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Personal Information', {
            'fields': ('first_name', 'last_name', 'full_name', 'slug', 'nationality', 
                       'date_of_birth', 'height', 'weight', 'preferred_foot', 'image')
        }),
        ('Team Information', {
            'fields': ('team', 'jersey_number', 'position')
        }),
        ('Statistics', {
            'fields': ('appearances', 'minutes_played', 'goals', 'assists', 
                      'yellow_cards', 'red_cards')
        }),
        ('Advanced Statistics', {
            'fields': ('expected_goals', 'expected_assists', 'shots', 'shots_on_target',
                      'key_passes', 'pass_completion', 'tackles', 'interceptions')
        }),
        ('Metadata', {
            'fields': ('fbref_id', 'created_at', 'updated_at')
        }),
    )
    prepopulated_fields = {'slug': ('first_name', 'last_name')}
