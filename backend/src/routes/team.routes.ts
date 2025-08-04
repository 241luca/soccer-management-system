import { Router, Response } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { teamService } from '../services/team.service';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';
import { AuthRequest } from '../types/auth.types';

const router = Router();
router.use(authenticate);

// Get all teams
router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) throw new BadRequestError('Organization ID required');
  
  const teams = await teamService.getTeams(organizationId, req.query);
  res.json({ data: teams });
}));

// Get single team
router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) throw new BadRequestError('Organization ID required');
  
  const team = await teamService.getTeamById(req.params.id, organizationId);
  res.json({ data: team });
}));

// Create team
router.post('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) throw new BadRequestError('Organization ID required');
  
  const team = await teamService.createTeam({
    ...req.body,
    organizationId
  });
  res.status(201).json({ data: team });
}));

// Update team
router.put('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) throw new BadRequestError('Organization ID required');
  
  const team = await teamService.updateTeam({
    ...req.body,
    id: req.params.id,
    organizationId
  });
  res.json({ data: team });
}));

// Delete team
router.delete('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) throw new BadRequestError('Organization ID required');
  
  await teamService.deleteTeam(req.params.id, organizationId);
  res.status(204).send();
}));

// Get team statistics
router.get('/:id/stats', asyncHandler(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) throw new BadRequestError('Organization ID required');
  
  const stats = await teamService.getTeamStats(req.params.id, organizationId);
  res.json({ data: stats });
}));

// Add athlete to team
router.post('/:id/athletes/:athleteId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) throw new BadRequestError('Organization ID required');
  
  await teamService.addAthleteToTeam(req.params.id, req.params.athleteId, organizationId);
  res.json({ message: 'Athlete added to team successfully' });
}));

// Remove athlete from team
router.delete('/:id/athletes/:athleteId', asyncHandler(async (req: AuthRequest, res: Response) => {
  const organizationId = req.user?.organizationId;
  if (!organizationId) throw new BadRequestError('Organization ID required');
  
  await teamService.removeAthleteFromTeam(req.params.id, req.params.athleteId, organizationId);
  res.json({ message: 'Athlete removed from team successfully' });
}));

export default router;
