import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// TODO: Implement payment routes
router.get('/', (req, res) => {
  res.json({ message: 'Payment routes not yet implemented' });
});

export default router;
