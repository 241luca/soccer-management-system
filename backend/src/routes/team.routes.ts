import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// TODO: Implement team routes
router.get('/', (req, res) => {
  res.json({ message: 'Team routes not yet implemented' });
});

export default router;
