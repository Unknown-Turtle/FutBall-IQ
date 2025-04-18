from django.db import models
from django.contrib.auth.models import User

class Team(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='team_logos/', null=True, blank=True)
    short_name = models.CharField(max_length=3, help_text="Three letter team code (e.g., 'ARS' for Arsenal)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Match(models.Model):
    SEASON = '2023-24'  # Current Premier League season

    home_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='home_matches')
    away_team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='away_matches')
    match_date = models.DateTimeField()
    match_week = models.IntegerField(help_text="Premier League matchweek number (1-38)")
    home_score = models.IntegerField(null=True, blank=True)
    away_score = models.IntegerField(null=True, blank=True)
    video_file = models.FileField(upload_to='match_videos/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-match_date']
        verbose_name_plural = "Matches"

    def __str__(self):
        scores = f" ({self.home_score}-{self.away_score})" if self.home_score is not None else ""
        return f"{self.home_team} vs {self.away_team} - MW{self.match_week}{scores}"

class Analysis(models.Model):
    ANALYSIS_STATUS = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
    ]

    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='analyses')
    analyst = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=ANALYSIS_STATUS, default='PENDING')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Analyses"
        ordering = ['-created_at']

    def __str__(self):
        return f"Analysis of {self.match} by {self.analyst}"

class AnalysisMetric(models.Model):
    METRIC_TYPES = [
        ('POSSESSION', 'Ball Possession'),
        ('SHOTS', 'Shots'),
        ('PASSES', 'Passes'),
        ('TACKLES', 'Tackles'),
        ('PRESSURE', 'Pressure'),
        ('FORMATION', 'Formation Change'),
        ('SUBSTITUTION', 'Substitution'),
        ('KEY_MOMENT', 'Key Moment'),
    ]

    analysis = models.ForeignKey(Analysis, on_delete=models.CASCADE, related_name='metrics')
    metric_type = models.CharField(max_length=20, choices=METRIC_TYPES)
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    value = models.JSONField(help_text="Stores metric data in JSON format")
    timestamp = models.FloatField(null=True, help_text="Timestamp in video (seconds)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.metric_type} - {self.team} ({self.analysis.match})"

    @property
    def timestamp_percentage(self):
        """Calculate position on timeline as percentage"""
        if self.timestamp and self.analysis.match.video_file:
            try:
                from django.core.files.storage import default_storage
                import cv2
                video_path = default_storage.path(self.analysis.match.video_file.name)
                cap = cv2.VideoCapture(video_path)
                duration = cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
                cap.release()
                return (self.timestamp / duration) * 100
            except:
                return 0
        return 0
