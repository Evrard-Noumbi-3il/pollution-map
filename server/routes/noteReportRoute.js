// routes/noteRoutes.js
import express from 'express';
import auth from '../middlewares/auth.js';
import { createNote, getNotesByReport, hasUserRated } from '../controllers/noteController.js';

const router = express.Router();

router.post('/api/notes',auth, createNote);
router.get('/api/notes/report/:reportId', getNotesByReport);
router.get('/api/notes/hasRated/:reportId',auth, hasUserRated);

export default router;
