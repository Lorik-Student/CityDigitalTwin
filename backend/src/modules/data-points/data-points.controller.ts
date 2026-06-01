import * as DataPointsModel from './data-points.model.js';
import type { Id } from '@shared/api-types';
import type { Request, Response } from 'express';

export const getCityProfile = async (req: Request, res: Response) => { 
    const city = await DataPointsModel.getCityProfile(req.params.id as Id);
    res.status(200).json(city);
}

export const getAllCityProfiles = async (req: Request, res: Response) => { 
    const cities = await DataPointsModel.getAllCityProfiles();
    res.status(200).json(cities);
}
