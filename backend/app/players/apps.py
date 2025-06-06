from django.apps import AppConfig


class PlayersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'players'
    
    def ready(self):
        import players.signals  # noqa
