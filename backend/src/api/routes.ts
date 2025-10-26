import { Router, Request, Response } from 'express';
import loiService from '../services/loi.service';
import { syncService } from '../services/sync.service';

const router = Router();

/**
 * GET /api/lois - Get all LOIs
 */
router.get('/lois', async (req: Request, res: Response) => {
  try {
    const conversationId = req.query.conversationId as string | undefined;
    const lois = await loiService.getAllLOIs(conversationId);
    res.json({ success: true, data: lois });
  } catch (error) {
    console.error('Error fetching LOIs:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch LOIs' });
  }
});

/**
 * GET /api/lois/:id - Get LOI by ID
 */
router.get('/lois/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const loi = await loiService.getLOIById(id);
    
    if (!loi) {
      return res.status(404).json({ success: false, error: 'LOI not found' });
    }
    
    res.json({ success: true, data: loi });
  } catch (error) {
    console.error('Error fetching LOI:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch LOI' });
  }
});

/**
 * POST /api/lois - Create new LOI
 */
router.post('/lois', async (req: Request, res: Response) => {
  try {
    const loiData = req.body;
    const createdBy = req.headers['x-user-name'] as string || 'Web User';
    
    // Validate required fields
    if (!loiData.customer || !loiData.product || !loiData.ratio || !loiData.incoterm || !loiData.period || !loiData.quantity_mt) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const loi = await loiService.createLOI({
      ...loiData,
      created_by: createdBy,
      teams_conversation_id: loiData.teams_conversation_id || 'web',
    });

    // Broadcast to other clients
    syncService.broadcastLOICreated(loi);

    res.status(201).json({ success: true, data: loi });
  } catch (error) {
    console.error('Error creating LOI:', error);
    res.status(500).json({ success: false, error: 'Failed to create LOI' });
  }
});

/**
 * PUT /api/lois/:id - Update LOI
 */
router.put('/lois/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const modifiedBy = req.headers['x-user-name'] as string || 'Web User';

    const updatedLOI = await loiService.updateLOI(id, updates, modifiedBy, 'web');

    // Broadcast to other clients and Teams
    syncService.broadcastLOIUpdated(updatedLOI, modifiedBy, 'web', updates);

    res.json({ success: true, data: updatedLOI });
  } catch (error: any) {
    console.error('Error updating LOI:', error);
    if (error.message === 'LOI not found') {
      return res.status(404).json({ success: false, error: 'LOI not found' });
    }
    res.status(500).json({ success: false, error: 'Failed to update LOI' });
  }
});

/**
 * DELETE /api/lois/:id - Delete LOI
 */
router.delete('/lois/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedBy = req.headers['x-user-name'] as string || 'Web User';
    
    const success = await loiService.deleteLOI(id);
    
    if (!success) {
      return res.status(404).json({ success: false, error: 'LOI not found' });
    }

    // Broadcast deletion
    syncService.broadcastLOIDeleted(id, deletedBy);

    res.json({ success: true, message: 'LOI deleted successfully' });
  } catch (error) {
    console.error('Error deleting LOI:', error);
    res.status(500).json({ success: false, error: 'Failed to delete LOI' });
  }
});

/**
 * GET /api/lois/:id/history - Get modification history for LOI
 */
router.get('/lois/:id/history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const history = await loiService.getModificationHistory(id);
    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Error fetching modification history:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

/**
 * GET /api/health - Health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

export default router;

