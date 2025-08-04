import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';

const router = Router();
router.use(authenticate);

// Placeholder routes - implementare con i services
router.get('/', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Payment routes - To be implemented with paymentService' });
});

router.post('/', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Create payment - To be implemented' });
});

router.post('/:id/record', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Record payment - To be implemented' });
});

export default router;
