from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Player

@receiver(post_save, sender=Player)
def player_saved(sender, instance, created, **kwargs):
    """
    Signal handler for when a player is saved
    """
    # You can implement logic to update aggregated stats for teams here
    pass

@receiver(post_delete, sender=Player)
def player_deleted(sender, instance, **kwargs):
    """
    Signal handler for when a player is deleted
    """
    # Clean up any related data if needed
    pass 