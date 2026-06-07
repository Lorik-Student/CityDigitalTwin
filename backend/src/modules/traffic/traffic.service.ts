import type { CongestionLevel, TrafficReading, TrafficSensor } from "@shared/api-types/traffic";

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getCongestionLevel(vehicleCount: number, averageSpeedKph: number): CongestionLevel {
    if (vehicleCount > 60 || averageSpeedKph < 22) return "high";
    if (vehicleCount > 32 || averageSpeedKph < 38) return "medium";
    return "low";
}

export function generateTrafficReadings(sensors: TrafficSensor[]): TrafficReading[] {
    return sensors.map((sensor) => {
        const rushHourFactor = new Date().getHours() >= 16 && new Date().getHours() <= 19 ? 18 : 0;
        const vehicleCount = randomInt(8, 58) + rushHourFactor;
        const averageSpeedKph = Math.max(8, randomInt(18, 62) - Math.floor(vehicleCount / 8));

        return {
            sensorId: sensor.id,
            vehicleCount,
            averageSpeedKph,
            congestionLevel: getCongestionLevel(vehicleCount, averageSpeedKph),
            timestamp: new Date().toISOString(),
        };
    });
}
