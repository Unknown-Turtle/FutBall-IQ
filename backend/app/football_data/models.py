from django.db import models

class Season(models.Model):
    year = models.CharField(max_length=9, unique=True, help_text="E.g., 2023-2024") # 2023-2024
    fbref_id = models.CharField(max_length=50, blank=True, null=True, help_text="FBRef ID for the season if available")

    def __str__(self):
        return self.year

class League(models.Model):
    name = models.CharField(max_length=100, unique=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    fbref_id = models.CharField(max_length=50, blank=True, null=True, help_text="FBRef ID for the league if available")

    def __str__(self):
        return self.name

class Team(models.Model):
    name = models.CharField(max_length=100, unique=True)
    short_name = models.CharField(max_length=50, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    fbref_id = models.CharField(max_length=50, unique=True, blank=True, null=True, help_text="FBRef ID for the team")
    current_league = models.ForeignKey(League, on_delete=models.SET_NULL, null=True, blank=True, related_name="current_teams")

    def __str__(self):
        return self.name

class Player(models.Model):
    name = models.CharField(max_length=200)
    fbref_id = models.CharField(max_length=50, unique=True, help_text="FBRef ID for the player")
    nationality = models.CharField(max_length=50, blank=True, null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    primary_position = models.CharField(max_length=50, blank=True, null=True) # E.g., MF, DF, FW, GK
    current_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name="players")

    def __str__(self):
        return f"{self.name} ({self.fbref_id})"

    class Meta:
        unique_together = (('name', 'fbref_id'),) # Assuming fbref_id should be unique on its own.

class Match(models.Model):
    season = models.ForeignKey(Season, on_delete=models.CASCADE, related_name="matches")
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name="matches")
    match_date = models.DateTimeField()
    home_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="home_matches")
    away_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="away_matches")
    home_score = models.PositiveIntegerField(null=True, blank=True)
    away_score = models.PositiveIntegerField(null=True, blank=True)
    home_xg = models.FloatField(null=True, blank=True, help_text="Expected Goals Home")
    away_xg = models.FloatField(null=True, blank=True, help_text="Expected Goals Away")
    venue = models.CharField(max_length=150, blank=True, null=True)
    referee = models.CharField(max_length=100, blank=True, null=True)
    fbref_match_id = models.CharField(max_length=50, unique=True, blank=True, null=True)

    def __str__(self):
        return f"{self.home_team} vs {self.away_team} ({self.match_date.date()})"

    class Meta:
        verbose_name_plural = "Matches"

# Base model for player statistics per season
class BasePlayerSeasonStat(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE) # Team player played for that season
    season = models.ForeignKey(Season, on_delete=models.CASCADE)
    league = models.ForeignKey(League, on_delete=models.CASCADE)
    matches_played = models.PositiveIntegerField(default=0)
    starts = models.PositiveIntegerField(default=0)
    minutes_played = models.PositiveIntegerField(default=0)
    
    class Meta:
        abstract = True
        unique_together = (('player', 'team', 'season', 'league'),) # Ensure one stat entry per player, per team, per season, per league

class PlayerStandardStat(BasePlayerSeasonStat):
    goals = models.PositiveIntegerField(default=0)
    assists = models.PositiveIntegerField(default=0)
    penalty_goals = models.PositiveIntegerField(default=0)
    penalty_attempts = models.PositiveIntegerField(default=0)
    yellow_cards = models.PositiveIntegerField(default=0)
    red_cards = models.PositiveIntegerField(default=0)
    xg = models.FloatField(null=True, blank=True, help_text="Expected Goals")
    npxg = models.FloatField(null=True, blank=True, help_text="Non-Penalty Expected Goals")
    xag = models.FloatField(null=True, blank=True, help_text="Expected Assisted Goals")
    # Add more standard stats as needed from fbref

    def __str__(self):
        return f"{self.player.name} - Standard Stats - {self.season.year} - {self.league.name}"

class PlayerShootingStat(BasePlayerSeasonStat):
    shots = models.PositiveIntegerField(default=0)
    shots_on_target = models.PositiveIntegerField(default=0)
    shots_on_target_pct = models.FloatField(null=True, blank=True)
    goals_per_shot = models.FloatField(null=True, blank=True)
    average_shot_distance = models.FloatField(null=True, blank=True)
    # Add more shooting stats as needed

    def __str__(self):
        return f"{self.player.name} - Shooting Stats - {self.season.year} - {self.league.name}"

class PlayerPassingStat(BasePlayerSeasonStat):
    passes_completed = models.PositiveIntegerField(default=0)
    passes_attempted = models.PositiveIntegerField(default=0)
    pass_completion_pct = models.FloatField(null=True, blank=True)
    total_passing_distance = models.PositiveIntegerField(default=0)
    progressive_passing_distance = models.PositiveIntegerField(default=0)
    key_passes = models.PositiveIntegerField(default=0) # Passes that directly lead to a shot
    # Add more passing stats as needed

    def __str__(self):
        return f"{self.player.name} - Passing Stats - {self.season.year} - {self.league.name}"

# Add other specific stat models like:
# PlayerDefensiveStat(BasePlayerSeasonStat)
# PlayerPossessionStat(BasePlayerSeasonStat)
# PlayerGoalkeepingStat(BasePlayerSeasonStat)
# etc.

# Base model for team statistics per season
class BaseTeamSeasonStat(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    season = models.ForeignKey(Season, on_delete=models.CASCADE)
    league = models.ForeignKey(League, on_delete=models.CASCADE)
    
    class Meta:
        abstract = True
        unique_together = (('team', 'season', 'league'),)

class TeamStandardStat(BaseTeamSeasonStat):
    goals_for = models.PositiveIntegerField(default=0)
    goals_against = models.PositiveIntegerField(default=0)
    assists = models.PositiveIntegerField(default=0)
    xg_for = models.FloatField(null=True, blank=True)
    xg_against = models.FloatField(null=True, blank=True)
    # Add more team standard stats

    def __str__(self):
        return f"{self.team.name} - Standard Stats - {self.season.year} - {self.league.name}"

# Add other specific team stat models as needed.

# Remember to run 'python manage.py makemigrations football_data' and 'python manage.py migrate'
# after defining or changing models. 