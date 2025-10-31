import { Router } from 'express';
import { login, registerTrial, getPlans, changePassword } from '../controllers/auth.controller';
import { validateRequest, authValidation } from '../middleware/validation.middleware';

const router = Router();

// Login validation
router.post('/login', validateRequest({
  username: authValidation.email, // username can be email
  password: authValidation.password
}), login);

// Register validation - handle nested objects
router.post('/register-trial', validateRequest({
  'orgData.name': (value: any) => !value ? 'Organization name is required' : null,
  'adminData.name': (value: any) => !value ? 'First name is required' : null,
  'adminData.lastNamePaternal': (value: any) => !value ? 'Last name is required' : null,
  'adminData.email': authValidation.email,
  'adminData.password': authValidation.strongPassword
}), registerTrial);

// Change password validation
router.post('/change-password', validateRequest({
  currentPassword: authValidation.password,
  newPassword: authValidation.strongPassword
}), changePassword);

router.get('/plans', getPlans);

export default router;