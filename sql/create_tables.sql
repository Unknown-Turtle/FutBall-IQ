CREATE DATABASE IF NOT EXISTS football_db;

USE football_db;

CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_name VARCHAR(100),
    nation VARCHAR(50),
    position VARCHAR(50),
    age FLOAT,
    matches_played INT,
    starts INT,
    minutes_played FLOAT,
    ninety_min_equiv FLOAT,
    goals FLOAT,
    assists FLOAT,
    -- Add other fields based on your CSV columns
    xG FLOAT,
    xAG FLOAT,
    npxG FLOAT,
    npxGxAG FLOAT
);