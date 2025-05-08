import soccerdata as sd
import pandas as pd
import traceback
import warnings


warnings.simplefilter(action='ignore', category=FutureWarning)

print("Attempting to use soccerdata...")
try:

    fbref = sd.FBref(leagues="ENG-Premier League", seasons=2024)#23/24
    print("Successfully initialized soccerdata.FBref for PL 2024")
    
    print("Fetching schedule...")
    schedule_df = fbref.read_schedule()
    print(f"Type returned by read_schedule(): {type(schedule_df)}")
    
    if isinstance(schedule_df, pd.DataFrame) and not schedule_df.empty:
        print(f"Successfully fetched schedule with {len(schedule_df)} rows using soccerdata.")

    elif isinstance(schedule_df, pd.DataFrame) and schedule_df.empty:
        print("Fetched schedule using soccerdata, but it returned an empty DataFrame.")
    else:
        print(f"Fetched schedule using soccerdata, but the result was not an expected DataFrame.")

except ImportError as e:
    print(f"ImportError: Failed to import soccerdata or its dependency: {e}")
    print("Please ensure you have run 'pip install -r backend/app/requirements.txt' after soccerdata was added.")
except Exception as e:
    print(f"An unexpected error occurred while using soccerdata: {e}")
    print("Traceback:")
    traceback.print_exc()