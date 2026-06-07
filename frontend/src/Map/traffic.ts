import type { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import type { TrafficReading, TrafficSensor } from "@shared/api-types/traffic";
import { API_BASE_URL, apiFetch } from "../auth/authClient";

const TRAFFIC_SOURCE_ID = "traffic-sensors-source";
const TRAFFIC_GLOW_LAYER_ID = "traffic-sensors-glow-layer";
const TRAFFIC_CIRCLE_LAYER_ID = "traffic-sensors-layer";
const TRAFFIC_LABEL_LAYER_ID = "traffic-sensors-label-layer";
const TRAFFIC_MIN_ZOOM = 13.5;

type TrafficSensorProperties = {
    id: string;
    name: string;
    roadName?: string | null;
    vehicleCount?: number;
    averageSpeedKph?: number;
    congestionLevel: "low" | "medium" | "high";
    timestamp?: string;
};

export async function fetchTrafficSensors(cityId: string): Promise<TrafficSensor[]> {
    return apiFetch<TrafficSensor[]>(`/traffic/sensors/${cityId}`, {
        method: "GET",
    });
}

export function connectTrafficStream(
    cityId: string,
    accessToken: string,
    onReadings: (readings: TrafficReading[]) => void,
    onError: () => void
): EventSource {
    const params = new URLSearchParams({ accessToken });
    const eventSource = new EventSource(`${API_BASE_URL}/traffic/live/${cityId}?${params.toString()}`);

    eventSource.addEventListener("traffic", (event) => {
        onReadings(JSON.parse(event.data) as TrafficReading[]);
    });

    eventSource.onerror = onError;

    return eventSource;
}

export function renderTrafficSensors(
    mapInstance: MapboxMap,
    sensors: TrafficSensor[],
    readings: TrafficReading[] = []
) {
    const readingsBySensorId = new Map(readings.map((reading) => [reading.sensorId, reading]));

    const data: GeoJSON.FeatureCollection<GeoJSON.Point, TrafficSensorProperties> = {
        type: "FeatureCollection",
        features: sensors.map((sensor) => {
            const reading = readingsBySensorId.get(sensor.id);

            return {
                type: "Feature",
                id: sensor.id,
                properties: {
                    id: sensor.id,
                    name: sensor.name,
                    roadName: sensor.roadName,
                    vehicleCount: reading?.vehicleCount,
                    averageSpeedKph: reading?.averageSpeedKph,
                    congestionLevel: reading?.congestionLevel ?? "low",
                    timestamp: reading?.timestamp,
                },
                geometry: {
                    type: "Point",
                    coordinates: [sensor.lng, sensor.lat],
                },
            };
        }),
    };

    const existingSource = mapInstance.getSource(TRAFFIC_SOURCE_ID) as GeoJSONSource | undefined;
    if (existingSource) {
        existingSource.setData(data);
        return;
    }

    if (!mapInstance.isStyleLoaded()) return;

    mapInstance.addSource(TRAFFIC_SOURCE_ID, {
        type: "geojson",
        data,
    });

    mapInstance.addLayer({
        id: TRAFFIC_GLOW_LAYER_ID,
        type: "circle",
        source: TRAFFIC_SOURCE_ID,
        minzoom: TRAFFIC_MIN_ZOOM,
        paint: {
            "circle-radius": [
                "case",
                ["==", ["get", "congestionLevel"], "high"], 30,
                ["==", ["get", "congestionLevel"], "medium"], 25,
                20,
            ],
            "circle-color": [
                "case",
                ["==", ["get", "congestionLevel"], "high"], "#ef4444",
                ["==", ["get", "congestionLevel"], "medium"], "#facc15",
                "#22c55e",
            ],
            "circle-opacity": 0.26,
            "circle-blur": 1,
        },
    });

    mapInstance.addLayer({
        id: TRAFFIC_CIRCLE_LAYER_ID,
        type: "circle",
        source: TRAFFIC_SOURCE_ID,
        minzoom: TRAFFIC_MIN_ZOOM,
        paint: {
            "circle-radius": [
                "case",
                ["==", ["get", "congestionLevel"], "high"], 12,
                ["==", ["get", "congestionLevel"], "medium"], 10,
                8,
            ],
            "circle-color": [
                "case",
                ["==", ["get", "congestionLevel"], "high"], "#ef4444",
                ["==", ["get", "congestionLevel"], "medium"], "#facc15",
                "#22c55e",
            ],
            "circle-stroke-color": "#ffffff",
            "circle-stroke-width": 2,
            "circle-opacity": 0.92,
            "circle-blur": 0.05,
        },
    });

    mapInstance.addLayer({
        id: TRAFFIC_LABEL_LAYER_ID,
        type: "symbol",
        source: TRAFFIC_SOURCE_ID,
        minzoom: TRAFFIC_MIN_ZOOM,
        layout: {
            "text-field": [
                "format",
                ["get", "roadName"], { "font-scale": 0.85 },
                "\n", {},
                ["to-string", ["coalesce", ["get", "vehicleCount"], 0]], { "font-scale": 0.75 },
                " cars", { "font-scale": 0.75 },
            ],
            "text-size": 12,
            "text-offset": [0, 1.6],
            "text-anchor": "top",
            "text-allow-overlap": false,
        },
        paint: {
            "text-color": "#ecfeff",
            "text-halo-color": "#02090c",
            "text-halo-width": 1.5,
        },
    });
}

export function removeTrafficSensors(mapInstance: MapboxMap) {
    if (mapInstance.getLayer(TRAFFIC_LABEL_LAYER_ID)) {
        mapInstance.removeLayer(TRAFFIC_LABEL_LAYER_ID);
    }

    if (mapInstance.getLayer(TRAFFIC_CIRCLE_LAYER_ID)) {
        mapInstance.removeLayer(TRAFFIC_CIRCLE_LAYER_ID);
    }

    if (mapInstance.getLayer(TRAFFIC_GLOW_LAYER_ID)) {
        mapInstance.removeLayer(TRAFFIC_GLOW_LAYER_ID);
    }

    if (mapInstance.getSource(TRAFFIC_SOURCE_ID)) {
        mapInstance.removeSource(TRAFFIC_SOURCE_ID);
    }
}
