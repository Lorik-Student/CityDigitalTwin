import z from "zod";

export const congestionLevelSchema = z.enum(["low", "medium", "high"]);

export const trafficSensorSchema = z.object({
    id: z.uuid(),
    cityId: z.uuid(),
    name: z.string().trim().min(2).max(100),
    roadName: z.string().trim().min(2).max(100).nullable().optional(),
    lat: z.number().refine((val) => val >= -90 && val <= 90),
    lng: z.number().refine((val) => val >= -180 && val <= 180),
});

export const trafficReadingSchema = z.object({
    sensorId: z.uuid(),
    vehicleCount: z.number().int().nonnegative(),
    averageSpeedKph: z.number().nonnegative(),
    congestionLevel: congestionLevelSchema,
    timestamp: z.string(),
});

export type CongestionLevel = z.infer<typeof congestionLevelSchema>;
export type TrafficSensor = z.infer<typeof trafficSensorSchema>;
export type TrafficReading = z.infer<typeof trafficReadingSchema>;
