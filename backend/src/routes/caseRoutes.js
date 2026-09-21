import { Router } from 'express';
import { createCase, getCases, getCaseById } from '../controllers/caseController.js';

const router = Router();

router.post('/', createCase);
router.get('/', getCases);
router.get('/:caseId', getCaseById);

export default router;
