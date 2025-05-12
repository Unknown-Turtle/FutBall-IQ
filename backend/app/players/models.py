from django.db import models
from django.utils.text import slugify
from teams.models import Team

class Position(models.Model):
    name = models.CharField(max_length=100, unique=True)
    short_name = models.CharField(max_length=10)
    
    def __str__(self):
        return self.name

class Player(models.Model):
    FOOT_CHOICES = (
        ('right', 'Right'),
        ('left', 'Left'),
        ('both', 'Both'),
    )
    
    # Personal Info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    full_name = models.CharField(max_length=200, blank=True)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    nationality = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    height = models.IntegerField(help_text="Height in cm", null=True, blank=True)
    weight = models.IntegerField(help_text="Weight in kg", null=True, blank=True)
    preferred_foot = models.CharField(max_length=5, choices=FOOT_CHOICES, default='right')
    
    # Team Info
    team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, related_name='players')
    jersey_number = models.IntegerField(null=True, blank=True)
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True)
    
    # Standard Stats
    appearances = models.IntegerField(default=0)
    minutes_played = models.IntegerField(default=0)
    goals = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    yellow_cards = models.IntegerField(default=0)
    red_cards = models.IntegerField(default=0)
    
    # Advanced Stats
    expected_goals = models.FloatField(default=0.0)  # xG
    expected_assists = models.FloatField(default=0.0)  # xA
    shots = models.IntegerField(default=0)
    shots_on_target = models.IntegerField(default=0)
    key_passes = models.IntegerField(default=0)
    pass_completion = models.FloatField(default=0.0)  # Percentage
    tackles = models.IntegerField(default=0)
    interceptions = models.IntegerField(default=0)
    
    # Meta
    fbref_id = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='player_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['team', 'last_name', 'first_name']
        
    def __str__(self):
        return f"{self.full_name}"
        
    def save(self, *args, **kwargs):
        if not self.full_name:
            self.full_name = f"{self.first_name} {self.last_name}"
        if not self.slug:
            self.slug = slugify(self.full_name)
        super().save(*args, **kwargs)
        
    @property
    def goals_per_90(self):
        if self.minutes_played > 0:
            return (self.goals * 90) / self.minutes_played
        return 0
        
    @property
    def assists_per_90(self):
        if self.minutes_played > 0:
            return (self.assists * 90) / self.minutes_played
        return 0
        
    @property
    def goal_contributions(self):
        return self.goals + self.assists
