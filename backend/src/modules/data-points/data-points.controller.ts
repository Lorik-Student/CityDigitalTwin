import * as DataPointsModel from './data-points.model';
import type { City, CityProfile } from "@shared/api-types/data-points";
import type { UUID } from '@shared/api-types'
import type { Request, Response } from 'express';

export const getCityProfile = async (req: Request, res: Response) => { 
    const city = await DataPointsModel.getCityProfile(req.params.uuid as UUID);
    res.status(200).json(city);
}

export const getAllCityProfiles = async (req: Request, res: Response) => { 
    const cities = await DataPointsModel.getAllCityProfiles();
    res.status(200).json(cities);
}