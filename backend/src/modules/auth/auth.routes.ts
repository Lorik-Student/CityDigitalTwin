import * as authController from "./auth.controller.js";
import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.js";
import { loginInfoSchema, signupInfoSchema } from "@shared/api-types/auth.js";

const router = Router();

router.post("/signup", validate({ body: signupInfoSchema }), authController.signup);
router.post("/login", validate({ body: loginInfoSchema }), authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
