import { Router } from 'express';
import * as Controller from './weather.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/current', Controller.getCurrentWeather);

export default router;

