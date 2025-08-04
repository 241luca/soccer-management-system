import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';

const router = Router();
router.use(authenticate);

// Placeholder routes - implementare con i services
router.get('/zones', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Transport zones - To be implemented with transportService' });
});

router.get('/buses', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Buses list - To be implemented' });
});

router.post('/athletes/assign', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Assign transport - To be implemented' });
});

export default router;
