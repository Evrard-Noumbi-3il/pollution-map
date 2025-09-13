import express from 'express';
import { createReport, getReports, deleteReport,getReport, updateReport,updateReportStatus, updateReportStatusAnnuler, getMyReports } from '../controllers/reportController.js';
import auth from '../middlewares/auth.js';
import authMiddleware from '../middlewares/authUser.js';
//import upload from '../middlewares/upload.js';
import multer from 'multer';
import { getReportImage } from '../controllers/reportController.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });
const router = express.Router();

router.post('/', auth, upload.single('image'), createReport);
router.get('/my', authMiddleware, getMyReports);
router.get('/', getReports);
router.get('/:id', getReport);
router.put("/:id", upload.single("image"), updateReport);
router.delete('/:id',  deleteReport);
router.get('/:id/image', getReportImage); 
router.put("/:id/status",updateReportStatus);
router.put("/:id/status/annuler", updateReportStatusAnnuler);


export default router;
