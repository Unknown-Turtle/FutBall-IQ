import csv
import db_config

def load_csv_to_db():
    connection = db_config.create_connection()
    cursor = connection.cursor()

    with open('data/Chelsea.csv', 'r') as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header row
        for row in reader:
            cursor.execute(
                "INSERT INTO players (name, team, position, appearances, goals, assists) VALUES (%s, %s, %s, %s, %s, %s)",
                row
            )

    connection.commit()
    cursor.close()
    connection.close()

if __name__ == '__main__':
    load_csv_to_db()