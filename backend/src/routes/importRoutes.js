import { Router } from 'express';
import multer from 'multer';
import { importFile } from '../controllers/importController.js';
import { requireAuth } from '../middleware/permission.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

router.use(requireAuth);

router.post('/', upload.single('file'), importFile);

export default router;
