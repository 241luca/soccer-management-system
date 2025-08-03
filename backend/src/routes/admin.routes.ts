import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.use(authorize('ADMIN'));

// TODO: Implement admin routes
router.get('/', (req, res) => {
  res.json({ message: 'Admin routes not yet implemented' });
});

export default router;
