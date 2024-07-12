import pandas as pd
import requests
from io import StringIO
from teams import TEAMS
Nat_col = 1
class Reader:
    def fetch_data(self, url, id, team_name):
        response = requests.get(url)
        html_content = response.text
        
        dfs = pd.read_html(StringIO(html_content), attrs={"id": id})
        df = dfs[0]
        
        df.to_csv(team_name+'.csv', index=False)
        df = pd.read_csv(team_name+'.csv', header = None)
    
        #the last line in this block is used to reedit the header because current formatting takes last 3 charaters, needs fixing
        df = df.iloc[1:]
        df = df.iloc[:, :-1]
        df[Nat_col] = df[Nat_col].apply(lambda x: x[-3:] if pd.notnull(x) else x)
        df.loc[1, 1] = "Nation"
        
        print(df.head())

        df.to_csv(team_name+'.csv', index=False)      


if __name__ == "__main__":
    url = 'https://fbref.com/en/squads/18bb7c10/2023-2024/Arsenal-Stats'
    id = 'stats_standard_9'
    reader = Reader()
    reader.fetch_data(url, id, "Che") 


""""
# Example usage
if __name__ == "__main__":
    reader = Reader()
    for team in TEAMS:
        team_name = team["team"]
        url = team["url"]
        id = 'stats_standard_9'
        
        try:
            reader.fetch_data(url, id, team_name)
        except Exception as e:
            print(f"Error trying to fetching data for {team_name}: {e}")
 """           
