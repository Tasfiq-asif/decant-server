import { Router } from 'express';
import { UserControllers } from './user.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../constants';

const router = Router();

// Admin only routes
router.post('/', 
  auth(USER_ROLE.ADMIN), 
  UserControllers.createUser
);

router.get('/', 
  auth(USER_ROLE.ADMIN), 
  UserControllers.getAllUsers
);

router.delete('/:id', 
  auth(USER_ROLE.ADMIN), 
  UserControllers.deleteUser
);

// User and Admin routes
router.get('/:id', 
  auth(USER_ROLE.USER, USER_ROLE.ADMIN), 
  UserControllers.getSingleUser
);

router.patch('/:id', 
  auth(USER_ROLE.USER, USER_ROLE.ADMIN), 
  UserControllers.updateUser
);

export const UserRoutes = router; 