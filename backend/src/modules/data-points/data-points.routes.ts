import { Router } from 'express';
import * as Controller from './data-points.controller.js'
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/cities', Controller.getAllCityProfiles);
router.get('/city/:id', Controller.getCityProfile)

export default router;
