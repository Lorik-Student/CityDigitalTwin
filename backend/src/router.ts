import { Router } from 'express'
import cityRoutes  from './modules/data-points/data-points.routes.js'
import authRoutes from './modules/auth/auth.routes.js'
import userRoutes from './modules/user/user.routes.js'
import weatherRoutes from './modules/weather/weather.routes.js'

const router = Router();

router.use('/data-points', cityRoutes)
router.use('/auth', authRoutes)
router.use('/users', userRoutes)
router.use('/weather', weatherRoutes)

export default router;
