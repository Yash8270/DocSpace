import { Router } from 'express';
import {
  getDocuments,
  createNewDocument,
  getDocumentDetails,
  updateDocumentDetails,
  deleteDocumentById
} from '../controllers/documentController.js';
import { requireAuth, requireDocumentPermission } from '../middleware/permission.js';

const router = Router();

router.use(requireAuth);

router.get('/', getDocuments);
router.post('/', createNewDocument);

router.get('/:id', requireDocumentPermission('READ'), getDocumentDetails);
router.patch('/:id', requireDocumentPermission('EDIT'), updateDocumentDetails);
router.delete('/:id', requireDocumentPermission('DELETE'), deleteDocumentById);

export default router;
