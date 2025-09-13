import express from 'express';
import { envoyerNotification, getMesNotifications, getNotificationById } from '../controllers/notificationController.js';
import authMiddleware from '../middlewares/authUser.js';

const router = express.Router();

router.post('/', envoyerNotification);
router.get('/mes', authMiddleware, getMesNotifications);
router.get('/:id', authMiddleware, getNotificationById);


export default router;
