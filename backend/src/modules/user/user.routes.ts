import { Router } from 'express';
import { userIdParamsSchema } from '@shared/api-types/users.js';
import { getUserProfile, getUsers, deleteUser, updateUser } from './user.controller.js';
import { authenticate, authorizeRole } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';

const router = Router();

// Protect all user routes
router.use(authenticate);

// Get current user profile
router.get('/me', getUserProfile);

// Admin only routes
router.get('/', authorizeRole(['admin']), getUsers);
router.patch('/:id', authorizeRole(['admin']), validate({ params: userIdParamsSchema }), updateUser);
router.delete('/:id', authorizeRole(['admin']), validate({ params: userIdParamsSchema }), deleteUser);
export default router;
