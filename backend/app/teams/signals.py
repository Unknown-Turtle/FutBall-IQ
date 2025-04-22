from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from teams.models import Team

# Example signal handlers 
# Uncomment and customize as needed when implementing team-related signals

# @receiver(post_save, sender=Team)
# def team_saved(sender, instance, created, **kwargs):
#     """
#     Signal handler for when a team is saved
#     """
#     pass

# @receiver(post_delete, sender=Team)
# def team_deleted(sender, instance, **kwargs):
#     """
#     Signal handler for when a team is deleted
#     """
#     pass 