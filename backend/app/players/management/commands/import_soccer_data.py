import datetime
import logging
import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify
from teams.models import Team
from players.models import Player, Position
import soccerdata as sd

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Import soccer data from soccerdata library'

    def add_arguments(self, parser):
        parser.add_argument('--leagues', nargs='+', default=['ENG-Premier League'], 
                           help='Leagues to import (e.g. "ENG-Premier League" "ESP-La Liga")')
        parser.add_argument('--seasons', nargs='+', default=['2324'], 
                           help='Seasons to import (e.g. "2324" "2223")')
        parser.add_argument('--data_type', choices=['teams', 'players', 'all'], default='all',
                           help='Type of data to import')

    def handle(self, *args, **options):
        leagues = options['leagues']
        seasons = options['seasons']
        data_type = options['data_type']
        
        self.stdout.write(self.style.SUCCESS(f'Importing data for leagues: {leagues}, seasons: {seasons}'))
        
        try:
            # Create an instance of FBref
            fbref = sd.FBref(leagues=leagues, seasons=seasons)
            
            if data_type in ['teams', 'all']:
                self.import_teams(fbref, leagues, seasons)
            
            if data_type in ['players', 'all']:
                self.import_players(fbref, leagues, seasons)
                
            self.stdout.write(self.style.SUCCESS('Data import completed successfully'))
        
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing data: {str(e)}'))
            logger.exception("Error importing data")
    
    def import_teams(self, fbref, leagues, seasons):
        """Import teams data"""
        self.stdout.write(self.style.SUCCESS('Importing teams data...'))
        
        try:
            # Get team standard stats
            team_stats = fbref.read_team_season_stats(stat_type='standard')
            
            # Create teams from the data
            with transaction.atomic():
                for index, row in team_stats.iterrows():
                    league, season, team_name = row.name
                    
                    # Skip if league is not in requested leagues
                    if league not in leagues:
                        continue
                    
                    team, created = Team.objects.update_or_create(
                        name=team_name,
                        defaults={
                            'slug': slugify(team_name),
                            'matches_played': row.get('MP', 0),
                            'wins': row.get('W', 0),
                            'draws': row.get('D', 0),
                            'losses': row.get('L', 0),
                            'goals_for': row.get('GF', 0),
                            'goals_against': row.get('GA', 0),
                            'points': row.get('Pts', 0),
                            'position': row.get('Rk', None),
                        }
                    )
                    
                    status = 'Created' if created else 'Updated'
                    self.stdout.write(f"{status} team: {team_name}")
            
            self.stdout.write(self.style.SUCCESS('Teams import completed'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing teams: {str(e)}'))
            logger.exception("Error importing teams")
    
    def import_players(self, fbref, leagues, seasons):
        """Import players data"""
        self.stdout.write(self.style.SUCCESS('Importing players data...'))
        
        try:
            # First, make sure we have the basic position types
            positions = {
                'GK': 'Goalkeeper',
                'DF': 'Defender',
                'MF': 'Midfielder',
                'FW': 'Forward'
            }
            
            position_objects = {}
            for short_name, name in positions.items():
                position, created = Position.objects.get_or_create(
                    name=name,
                    defaults={'short_name': short_name}
                )
                position_objects[short_name] = position
            
            # Get player standard stats
            player_stats = fbref.read_player_season_stats(stat_type='standard')
            
            # Get shooting stats for xG
            shooting_stats = fbref.read_player_season_stats(stat_type='shooting')
            
            # Get passing stats for xA
            passing_stats = fbref.read_player_season_stats(stat_type='passing')
            
            # Get defensive stats
            defense_stats = fbref.read_player_season_stats(stat_type='defense')
            
            with transaction.atomic():
                # Process each player
                for index, row in player_stats.iterrows():
                    league, season, team_name, player_name = index
                    
                    # Skip if league is not in requested leagues
                    if league not in leagues:
                        continue
                    
                    # Get or create the team
                    try:
                        team = Team.objects.get(name=team_name)
                    except Team.DoesNotExist:
                        self.stdout.write(self.style.WARNING(f"Team {team_name} does not exist. Creating..."))
                        team = Team.objects.create(name=team_name, slug=slugify(team_name))
                    
                    # Parse position (could be multiple like "FW,MF")
                    position_str = str(row.get('pos', ''))
                    main_position = position_str.split(',')[0] if ',' in position_str else position_str
                    
                    # Get the corresponding Position object
                    position = position_objects.get(main_position)
                    if not position and main_position:
                        position, _ = Position.objects.get_or_create(
                            name=main_position,
                            defaults={'short_name': main_position[:2]}
                        )
                    
                    # Extract first and last name
                    name_parts = player_name.split(' ', 1)
                    first_name = name_parts[0]
                    last_name = name_parts[1] if len(name_parts) > 1 else ''
                    
                    # Try to get xG and xA from the other dataframes
                    try:
                        xg = shooting_stats.loc[(league, season, team_name, player_name), 'xG']
                    except (KeyError, AttributeError):
                        xg = 0.0
                        
                    try:
                        xa = passing_stats.loc[(league, season, team_name, player_name), 'xAG']
                    except (KeyError, AttributeError):
                        xa = 0.0
                    
                    # Try to get defensive stats
                    try:
                        tkl = defense_stats.loc[(league, season, team_name, player_name), 'Tkl']
                        int_val = defense_stats.loc[(league, season, team_name, player_name), 'Int']
                    except (KeyError, AttributeError):
                        tkl = 0
                        int_val = 0
                    
                    # Create a unique slug including the team name
                    unique_slug = slugify(f"{player_name}-{team_name}")
                    
                    # Create/update player
                    player, created = Player.objects.update_or_create(
                        full_name=player_name,
                        team=team,
                        defaults={
                            'first_name': first_name,
                            'last_name': last_name,
                            'slug': unique_slug,
                            'nationality': row.get('nation', ''),
                            'position': position,
                            'appearances': row.get('MP', 0),
                            'minutes_played': row.get('Min', 0),
                            'goals': row.get('Gls', 0),
                            'assists': row.get('Ast', 0),
                            'yellow_cards': row.get('CrdY', 0),
                            'red_cards': row.get('CrdR', 0),
                            'expected_goals': xg,
                            'expected_assists': xa,
                            'tackles': tkl,
                            'interceptions': int_val,
                            'fbref_id': str(index),  # Use the index tuple as a unique identifier
                        }
                    )
                    
                    status = 'Created' if created else 'Updated'
                    self.stdout.write(f"{status} player: {player_name} ({team_name})")
            
            self.stdout.write(self.style.SUCCESS('Players import completed'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing players: {str(e)}'))
            logger.exception("Error importing players") 