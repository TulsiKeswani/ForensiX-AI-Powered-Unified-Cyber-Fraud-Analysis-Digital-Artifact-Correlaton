import { Router } from 'express';
import { getGraphData, getEntityDetails, getKingpinPrediction } from '../controllers/graphController.js';

const router = Router();

router.get('/cases/:caseId/graph', getGraphData);
router.get('/cases/:caseId/kingpin', getKingpinPrediction);
router.get('/entities/:entityId', getEntityDetails);

export default router;
