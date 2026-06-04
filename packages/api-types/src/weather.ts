export type WeatherCurrent = {
    locationName: string;
    region?: string;
    country?: string;
    localTime?: string;
    condition: string;
    iconUrl?: string;
    temperatureC: number;
    feelsLikeC: number;
    humidity: number;
    windKph: number;
    windDirection: string;
    pressureMb: number;
    uv: number;
    updatedAt: string;
};

