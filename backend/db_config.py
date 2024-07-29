import csv
import mysql.connector
from mysql.connector import Error

def create_connection():
    connection = None
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='football_db',
            user='your_username',
            password='your_password'
        )
    except Error as e:
        print(f"The error '{e}' occurred")
    return connection

def load_csv_to_db():
    connection = create_connection()
    cursor = connection.cursor()

    with open('data/Chelsea.csv', 'r') as file:
        reader = csv.reader(file)
        headers = next(reader)
        for row in reader:
            cursor.execute(
                "INSERT INTO players (player_name, nation, position, age, matches_played, starts, minutes_played, ninety_min_equiv, goals, assists, xG, xAG, npxG, npxGxAG) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
                row[:14]
            )

    connection.commit()
    cursor.close()
    connection.close()

if __name__ == '__main__':
    load_csv_to_db()