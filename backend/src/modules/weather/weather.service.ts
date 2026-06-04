import type { WeatherCurrent } from '@shared/api-types/weather.js';
import { BadRequestError, InternalServerError } from '../../http-errors.js';

type WeatherApiCurrentResponse = {
    location: {
        name: string;
        region?: string;
        country?: string;
        localtime?: string;
    };
    current: {
        last_updated: string;
        temp_c: number;
        feelslike_c: number;
        humidity: number;
        wind_kph: number;
        wind_dir: string;
        pressure_mb: number;
        uv: number;
        condition: {
            text: string;
            icon?: string;
        };
    };
};

const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1/current.json';

function normalizeIconUrl(iconUrl?: string) {
    if (!iconUrl) return undefined;
    return iconUrl.startsWith('//') ? `https:${iconUrl}` : iconUrl;
}

function validateCoordinates(lat: number, lng: number) {
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        throw new BadRequestError({ message: 'Latitude must be between -90 and 90.' });
    }

    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        throw new BadRequestError({ message: 'Longitude must be between -180 and 180.' });
    }
}

export async function getCurrentWeather(lat: number, lng: number): Promise<WeatherCurrent> {
    validateCoordinates(lat, lng);

    const apiKey = process.env.WEATHER_API_KEY;
    if (!apiKey) {
        throw new InternalServerError({
            code: 'WEATHER_API_KEY_MISSING',
            message: 'Weather API key is not configured.',
        });
    }

    const url = new URL(WEATHER_API_BASE_URL);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('q', `${lat},${lng}`);
    url.searchParams.set('aqi', 'no');

    const response = await fetch(url);
    if (!response.ok) {
        throw new InternalServerError({
            code: 'WEATHER_API_REQUEST_FAILED',
            message: 'Unable to load weather data.',
            options: { details: { status: response.status } },
        });
    }

    const payload = (await response.json()) as WeatherApiCurrentResponse;

    return {
        locationName: payload.location.name,
        region: payload.location.region,
        country: payload.location.country,
        localTime: payload.location.localtime,
        condition: payload.current.condition.text,
        iconUrl: normalizeIconUrl(payload.current.condition.icon),
        temperatureC: payload.current.temp_c,
        feelsLikeC: payload.current.feelslike_c,
        humidity: payload.current.humidity,
        windKph: payload.current.wind_kph,
        windDirection: payload.current.wind_dir,
        pressureMb: payload.current.pressure_mb,
        uv: payload.current.uv,
        updatedAt: payload.current.last_updated,
    };
}

