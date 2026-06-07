import type { TrafficSensor } from "@shared/api-types/traffic";
import type { Id } from "@shared/api-types";
import pg, { toCamelCase } from "../../db.js";

const PRIZREN_SENSOR_SEED = [
    { name: "Prizren Center Sensor", roadName: "Sheshi Shadervan", lat: 42.2099, lng: 20.7415 },
    { name: "Fortress Road Sensor", roadName: "Rruga Kalaja", lat: 42.2118, lng: 20.7466 },
    { name: "Transit Road Sensor", roadName: "Rruga Tirana", lat: 42.2165, lng: 20.7332 },
    { name: "Bus Station Sensor", roadName: "Rruga De Rada", lat: 42.2187, lng: 20.7375 },
    { name: "University Road Sensor", roadName: "Rruga Remzi Ademaj", lat: 42.2147, lng: 20.7442 },
];

async function getCityName(cityId: Id): Promise<string | null> {
    const { rows } = await pg.query<{ name: string }>("SELECT name FROM Cities WHERE uuid = $1", [cityId]);
    return rows[0]?.name ?? null;
}

function getFallbackSensors(cityId: Id, cityName: string | null): TrafficSensor[] {
    if (cityName?.trim().toLowerCase() !== "prizren") {
        return [];
    }

    return PRIZREN_SENSOR_SEED.map((sensor, index) => ({
        id: `${cityId.slice(0, 24)}${String(index + 1).padStart(12, "0")}`,
        cityId,
        ...sensor,
    }));
}

export async function getTrafficSensors(cityId: Id): Promise<TrafficSensor[]> {
    const query = `
        SELECT uuid as id, city_uuid as city_id, name, road_name, lat, lng
        FROM TrafficSensors
        WHERE city_uuid = $1
        ORDER BY name
    `;

    const cityName = await getCityName(cityId);

    try {
        const { rows } = await pg.query<TrafficSensor>(query, [cityId]);
        const sensors = rows.map(toCamelCase<TrafficSensor>);

        return sensors.length > 0 ? sensors : getFallbackSensors(cityId, cityName);
    } catch (error) {
        console.warn("Using fallback traffic sensors because TrafficSensors could not be queried.", error);
        return getFallbackSensors(cityId, cityName);
    }
}
