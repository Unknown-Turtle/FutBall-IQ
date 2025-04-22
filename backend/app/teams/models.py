from django.db import models
from django.utils.text import slugify

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    logo = models.ImageField(upload_to='team_logos/', null=True, blank=True)
    founded_year = models.IntegerField(null=True, blank=True)
    stadium = models.CharField(max_length=100, blank=True)
    manager = models.CharField(max_length=100, blank=True)
    
    # Season Stats
    matches_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    goals_for = models.IntegerField(default=0)
    goals_against = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    position = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def goal_difference(self):
        return self.goals_for - self.goals_against

    @property
    def win_percentage(self):
        if self.matches_played > 0:
            return (self.wins / self.matches_played) * 100
        return 0 