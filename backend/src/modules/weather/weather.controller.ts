import type { Request, Response } from 'express';
import * as WeatherService from './weather.service.js';

export const getCurrentWeather = async (req: Request, res: Response) => {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const weather = await WeatherService.getCurrentWeather(lat, lng);

    res.status(200).json(weather);
};

