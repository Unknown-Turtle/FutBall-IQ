from flask import Flask, jsonify
import db_config

app = Flask(__name__)

@app.route('/api/players', methods=['GET'])
def get_players():
    connection = db_config.create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute("SELECT * FROM players")
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return jsonify(rows)

if __name__ == '__main__':
    app.run(debug=True)