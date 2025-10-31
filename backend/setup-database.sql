-- Run this script to set up the database
-- Connect to PostgreSQL first: psql postgres

-- Create database
CREATE DATABASE prm_db;

-- Create user (optional)
CREATE USER prm_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE prm_db TO prm_user;

-- Connect to the new database
\c prm_db;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO prm_user;
