import { Router } from 'express';
import * as Controller from './data-points.controller'

const router = Router();

router.get('/cities', Controller.getAllCityProfiles);
router.get('/city/:id', Controller.getCityProfile)

export default router;