import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../types/auth.types';

const router = Router();
router.use(authenticate);

// Placeholder routes - implementare con i services
router.get('/', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Document routes - To be implemented with documentService' });
});

router.post('/upload/:athleteId', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Document upload - To be implemented' });
});

router.get('/:id/download', (req: AuthRequest, res: Response) => {
  res.json({ message: 'Document download - To be implemented' });
});

export default router;
