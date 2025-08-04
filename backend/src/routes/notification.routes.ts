import { Router } from 'express';
import { notificationService } from '../services/notification.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// Get notifications
router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await notificationService.findAll(
      req.user?.organizationId || '',
      req.user?.id || req.user?.userId || "",
      {
        unread: req.query.unread === 'true',
        type: req.query.type as string,
        severity: req.query.severity as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      }
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Mark as read
router.put('/:id/read', async (req: AuthRequest, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user?.id || req.user?.userId || "");
    res.json(notification);
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.put('/read-all', async (req: AuthRequest, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(
      req.user?.organizationId || '',
      req.user?.id || req.user?.userId || ""
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await notificationService.delete(req.params.id, req.user?.id || req.user?.userId || "");
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Clear all notifications
router.delete('/', async (req: AuthRequest, res, next) => {
  try {
    const result = await notificationService.clearAll(
      req.user?.organizationId || '',
      req.user?.id || req.user?.userId || ""
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
