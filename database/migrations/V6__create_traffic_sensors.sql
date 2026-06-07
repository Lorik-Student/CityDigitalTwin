CREATE TABLE TrafficSensors (
    uuid UUID DEFAULT gen_random_uuid() UNIQUE PRIMARY KEY,
    city_uuid UUID NOT NULL REFERENCES Cities(uuid) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    road_name VARCHAR(100),
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL
);

INSERT INTO TrafficSensors (city_uuid, name, road_name, lat, lng)
SELECT uuid, sensor_name, road_name, lat, lng
FROM Cities
CROSS JOIN (
    VALUES
        ('Prizren Center Sensor', 'Sheshi Shadervan', 42.2099, 20.7415),
        ('Fortress Road Sensor', 'Rruga Kalaja', 42.2118, 20.7466),
        ('Transit Road Sensor', 'Rruga Tirana', 42.2165, 20.7332),
        ('Bus Station Sensor', 'Rruga De Rada', 42.2187, 20.7375),
        ('University Road Sensor', 'Rruga Remzi Ademaj', 42.2147, 20.7442)
) AS sensors(sensor_name, road_name, lat, lng)
WHERE Cities.name = 'Prizren';
