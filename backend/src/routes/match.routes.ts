import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';

const router = Router();
router.use(authenticate);

// Placeholder routes - implementare con i services
router.get('/', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Match routes - To be implemented with matchService' });
});

router.post('/', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Create match - To be implemented' });
});

router.put('/:id/roster', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Update roster - To be implemented' });
});

export default router;
