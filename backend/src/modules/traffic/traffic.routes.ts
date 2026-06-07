import { Router } from "express";
import * as Controller from "./traffic.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/sensors/:cityId", Controller.getTrafficSensors);
router.get("/live/:cityId", Controller.streamTrafficReadings);

export default router;
