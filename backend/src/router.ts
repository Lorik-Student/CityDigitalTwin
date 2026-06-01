import { Router } from 'express'
import cityRoutes  from './modules/data-points/data-points.routes.js'
import authRoutes from './modules/auth/auth.routes.js'
import userRoutes from './modules/user/user.routes.js'

const router = Router();

router.use('/data-points', cityRoutes)
router.use('/auth', authRoutes)
router.use('/users', userRoutes)

export default router;
