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
            
            # Get team table to get wins, draws, and losses
            try:
                team_table = fbref.read_team_table()
                has_table = True
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"Couldn't get team table: {str(e)}"))
                has_table = False
            
            # Create teams from the data
            with transaction.atomic():
                for index, row in team_stats.iterrows():
                    league, season, team_name = row.name
                    
                    # Skip if league is not in requested leagues
                    if league not in leagues:
                        continue
                    
                    # Extract team stats from multi-level columns
                    matches_played = row.get(('Playing Time', 'MP'), 0)
                    goals_for = row.get(('Performance', 'Gls'), 0)
                    
                    # Defaults if we can't get from the team table
                    wins = 0
                    draws = 0
                    losses = 0
                    goals_against = 0
                    points = 0
                    position = None
                    
                    # Try to get additional stats from team table
                    if has_table:
                        try:
                            table_row = team_table.loc[(league, season, team_name)]
                            wins = table_row.get('W', 0)
                            draws = table_row.get('D', 0)
                            losses = table_row.get('L', 0)
                            goals_against = table_row.get('GA', 0)
                            points = table_row.get('Pts', 0)
                            position = table_row.get('Rk', None)
                        except (KeyError, AttributeError):
                            pass
                    
                    team, created = Team.objects.update_or_create(
                        name=team_name,
                        defaults={
                            'slug': slugify(team_name),
                            'matches_played': matches_played,
                            'wins': wins,
                            'draws': draws,
                            'losses': losses,
                            'goals_for': goals_for,
                            'goals_against': goals_against,
                            'points': points,
                            'position': position,
                        }
                    )
                    
                    status = 'Created' if created else 'Updated'
                    self.stdout.write(f"{status} team: {team_name} - MP: {matches_played}, W: {wins}, D: {draws}, L: {losses}, GF: {goals_for}, GA: {goals_against}, Pts: {points}")
            
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
                    
                    # Access multi-level column data correctly
                    # The columns are in format ('group', 'stat'), e.g., ('Playing Time', 'MP')
                    nationality = row.get('nation', '')
                    position_str = str(row.get('pos', ''))
                    
                    # Extract stats using the multi-level column structure
                    appearances = row.get(('Playing Time', 'MP'), 0)
                    minutes_played = row.get(('Playing Time', 'Min'), 0)
                    goals = row.get(('Performance', 'Gls'), 0)
                    assists = row.get(('Performance', 'Ast'), 0)
                    yellow_cards = row.get(('Performance', 'CrdY'), 0)
                    red_cards = row.get(('Performance', 'CrdR'), 0)
                    expected_goals = row.get(('Expected', 'xG'), 0.0)
                    expected_assists = row.get(('Expected', 'xAG'), 0.0)
                    
                    # Parse position (could be multiple like "FW,MF")
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
                    
                    # Try to get additional stats from other dataframes
                    # Shooting stats
                    try:
                        shooting_row = shooting_stats.loc[(league, season, team_name, player_name)]
                        shots = shooting_row.get(('Standard', 'Sh'), 0)
                        shots_on_target = shooting_row.get(('Standard', 'SoT'), 0)
                    except (KeyError, AttributeError):
                        shots = 0
                        shots_on_target = 0
                    
                    # Passing stats
                    try:
                        passing_row = passing_stats.loc[(league, season, team_name, player_name)]
                        key_passes = passing_row.get(('Pass Types', 'KP'), 0)
                        pass_completion_val = passing_row.get(('Total', 'Cmp%'), None)
                        # Handle NA or non-numeric values
                        if pd.isna(pass_completion_val) or pass_completion_val == 'NA':
                            pass_completion = None
                        else:
                            try:
                                pass_completion = float(pass_completion_val)
                            except (ValueError, TypeError):
                                pass_completion = None
                    except (KeyError, AttributeError):
                        key_passes = 0
                        pass_completion = None
                    
                    # Defensive stats
                    try:
                        defense_row = defense_stats.loc[(league, season, team_name, player_name)]
                        tackles = defense_row.get(('Tackles', 'Tkl'), 0)
                        interceptions = defense_row.get(('Int', ''), 0)  # Might need adjustment
                    except (KeyError, AttributeError):
                        tackles = 0
                        interceptions = 0
                    
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
                            'nationality': nationality,
                            'position': position,
                            'appearances': appearances,
                            'minutes_played': minutes_played,
                            'goals': goals,
                            'assists': assists,
                            'yellow_cards': yellow_cards,
                            'red_cards': red_cards,
                            'expected_goals': expected_goals,
                            'expected_assists': expected_assists,
                            'shots': shots,
                            'shots_on_target': shots_on_target,
                            'key_passes': key_passes,
                            'pass_completion': pass_completion,
                            'tackles': tackles,
                            'interceptions': interceptions,
                            'fbref_id': str(index),  # Use the index tuple as a unique identifier
                        }
                    )
                    
                    status = 'Created' if created else 'Updated'
                    self.stdout.write(f"{status} player: {player_name} ({team_name}) - Apps: {appearances}, Goals: {goals}, Assists: {assists}")
            
            self.stdout.write(self.style.SUCCESS('Players import completed'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error importing players: {str(e)}'))
            logger.exception("Error importing players") 