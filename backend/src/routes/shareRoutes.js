import { Router } from 'express';
import {
  getDocumentShares,
  addShare,
  removeShare
} from '../controllers/shareController.js';
import { requireAuth, requireDocumentPermission } from '../middleware/permission.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/:id/shares', requireDocumentPermission('SHARE'), getDocumentShares);
router.post('/:id/shares', requireDocumentPermission('SHARE'), addShare);
router.delete('/:id/shares/:userId', requireDocumentPermission('SHARE'), removeShare);

export default router;
