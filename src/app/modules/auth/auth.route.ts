import { Router } from 'express';
import { AuthControllers } from './auth.controller';

const router = Router();

router.post('/register', AuthControllers.register);
router.post('/login', AuthControllers.login);
router.post('/change-password', AuthControllers.changePassword);

export const AuthRoutes = router; 