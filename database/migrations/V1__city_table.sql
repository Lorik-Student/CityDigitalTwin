CREATE EXTENSION IF NOT EXISTS pgcrypto;     -- for gen_random_uuid()
--CREATE EXTENSION IF NOT EXISTS postgis;      -- recommended for map data


CREATE TABLE Cities (
    uuid UUID DEFAULT gen_random_uuid() UNIQUE PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    weather_condition VARCHAR(40) DEFAULT 'Normal',
    population INT NOT NULL CHECK(population >= 0),
    area INT NOT NULL CHECK(area >= 0),
    details TEXT
)