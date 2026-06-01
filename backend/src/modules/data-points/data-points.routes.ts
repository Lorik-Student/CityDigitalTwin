import { Router } from 'express';
import * as Controller from './data-points.controller'
import { authenticate, authorizeRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/cities', Controller.getAllCityProfiles);
router.get('/city/:id', Controller.getCityProfile)

export default router;