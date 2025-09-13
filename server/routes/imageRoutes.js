import express from 'express';
import { getImageByReportId } from '../controllers/imageController.js';

const router = express.Router();

// Route pour obtenir une image par ID de report
router.get('/:reportId', getImageByReportId);

export default router;
