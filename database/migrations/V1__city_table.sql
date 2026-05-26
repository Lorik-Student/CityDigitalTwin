CREATE TABLE Cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    long DOUBLE PRECISION NOT NULL,
    weather_condition VARCHAR(40) DEFAULT 'Normal',
    population INT NOT NULL CHECK(population >= 0),
    details TEXT
)