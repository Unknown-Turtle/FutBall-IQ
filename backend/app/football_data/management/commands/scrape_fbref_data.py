import soccerdata as sd
import pandas as pd
import traceback
import warnings
from django.core.management.base import BaseCommand
from football_data.models import Season, League, Team, Player, Match, PlayerStandardStat, TeamStandardStat # Added TeamStandardStat

# Ignore the specific FutureWarning from pandas concatenation often seen in soccerdata
warnings.simplefilter(action='ignore', category=FutureWarning)

class Command(BaseCommand):
    help = 'Scrapes FBREF data for a specified season and league using soccerdata, then organizes and normalizes it into the database.'

    def add_arguments(self, parser):
        # soccerdata uses end year for season, e.g., 2024 for 2023-2024
        # soccerdata uses specific league IDs, e.g., "ENG-Premier League"
        parser.add_argument('--season_year', type=int, help='The end year of the season to scrape (e.g., 2024 for 2023-2024)', default=2024)
        parser.add_argument('--league_id', type=str, help='The soccerdata league ID (e.g., ENG-Premier League)', default='ENG-Premier League')

    def handle(self, *args, **options):
        season_end_year = options['season_year']
        league_id_sd = options['league_id']

        # Determine league name for display/model (might need mapping from ID)
        # For now, assume ID is sufficient or can be derived
        league_name_display = league_id_sd.replace('-', ' ') # Simple guess
        season_year_model_format = f"{season_end_year-1}-{season_end_year}"

        self.stdout.write(self.style.SUCCESS(f'Starting FBREF data scraping via soccerdata for {league_name_display} season {season_year_model_format}...'))

        try:
            # Initialize soccerdata FBref scraper
            fbref = sd.FBref(leagues=league_id_sd, seasons=season_end_year)
            self.stdout.write(self.style.SUCCESS(f'Successfully initialized soccerdata.FBref for {league_id_sd} {season_end_year}'))

            # --- Get or create Season and League objects ---
            season_obj, created = Season.objects.get_or_create(year=season_year_model_format)
            self.log_get_or_create(created, "Season", season_obj)
            
            # Use the display name for the League model, assuming it stores full names
            league_obj, created = League.objects.get_or_create(name=league_name_display)
            self.log_get_or_create(created, "League", league_obj)

            # --- Fetch Schedule (Matches) ---
            self.stdout.write(f'Fetching schedule for {league_id_sd} {season_end_year}...')
            schedule_df = fbref.read_schedule()
            if isinstance(schedule_df, pd.DataFrame) and not schedule_df.empty:
                self.stdout.write(self.style.SUCCESS(f'Successfully fetched schedule with {len(schedule_df)} matches.'))
                print("--- Schedule DataFrame Head ---")
                print(schedule_df.head()) # Uncommented for debugging
                # TODO: Normalize schedule_df and save to Match model
            else:
                self.stdout.write(self.style.WARNING(f'Schedule data was empty or not a DataFrame. Type: {type(schedule_df)}'))

            # --- Fetch Player Standard Stats ---
            player_stat_type = 'standard'
            self.stdout.write(f'Fetching player {player_stat_type} stats for {league_id_sd} {season_end_year}...')
            player_stats_df = fbref.read_player_season_stats(stat_type=player_stat_type)
            if isinstance(player_stats_df, pd.DataFrame) and not player_stats_df.empty:
                self.stdout.write(self.style.SUCCESS(f'Successfully fetched player {player_stat_type} stats for {len(player_stats_df)} player-seasons.'))
                print("--- Player Standard Stats DataFrame Head ---")
                print(player_stats_df.head()) # Uncommented for debugging
                # TODO: Normalize player_stats_df and save to Player and PlayerStandardStat models
            else:
                self.stdout.write(self.style.WARNING(f'Player {player_stat_type} stats were empty or not a DataFrame. Type: {type(player_stats_df)}'))

            # --- Fetch Team Standard Stats ---
            team_stat_type = 'standard'
            self.stdout.write(f'Fetching team {team_stat_type} stats for {league_id_sd} {season_end_year}...')
            # Fetch regular stats (not opponent stats)
            team_stats_df = fbref.read_team_season_stats(stat_type=team_stat_type, opponent_stats=False)
            if isinstance(team_stats_df, pd.DataFrame) and not team_stats_df.empty:
                self.stdout.write(self.style.SUCCESS(f'Successfully fetched team {team_stat_type} stats for {len(team_stats_df)} teams.'))
                print("--- Team Standard Stats DataFrame Head ---")
                print(team_stats_df.head()) # Uncommented for debugging
                # TODO: Normalize team_stats_df and save to Team and TeamStandardStat models
            else:
                self.stdout.write(self.style.WARNING(f'Team {team_stat_type} stats were empty or not a DataFrame. Type: {type(team_stats_df)}'))

            # --- Placeholder for other stat types ---
            # You would add similar blocks for 'shooting', 'passing', 'defense', etc.
            # Example:
            # self.stdout.write(f'Fetching player shooting stats...')
            # player_shooting_df = fbref.read_player_season_stats(stat_type='shooting')
            # if isinstance(player_shooting_df, pd.DataFrame) and not player_shooting_df.empty:
            #    self.stdout.write(self.style.SUCCESS(f'Fetched player shooting stats ({len(player_shooting_df)} rows).'))
            #    # TODO: Normalize and save to PlayerShootingStat model
            # else:
            #    self.stdout.write(self.style.WARNING('Player shooting stats were empty.'))


        except ImportError as e:
            self.stderr.write(self.style.ERROR(f'Failed to import soccerdata or its dependency: {e}'))
            self.stderr.write(self.style.ERROR('Ensure soccerdata is installed via requirements.txt.'))
            return
        except Exception as e:
            self.stderr.write(self.style.ERROR(f'An error occurred during scraping with soccerdata: {e}'))
            self.stderr.write(self.style.ERROR("Traceback:"))
            traceback.print_exc() # Print full traceback for debugging
            return

        self.stdout.write(self.style.SUCCESS(f'Data scraping process via soccerdata for {league_name_display} {season_year_model_format} finished. Data is ready for normalization.'))

    def log_get_or_create(self, created, model_name, instance):
        """Helper function to log object creation/retrieval."""
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created {model_name}: {instance}'))
        else:
            self.stdout.write(f'Found existing {model_name}: {instance}')

# To make this command discoverable, ensure __init__.py files exist in:
# backend/app/football_data/management/
# backend/app/football_data/management/commands/
# And that 'football_data' is in INSTALLED_APPS in your Django settings.