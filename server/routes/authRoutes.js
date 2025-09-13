import express from 'express';
import multer from 'multer';
import { login } from '../controllers/authController.js';
import { registerUser } from '../controllers/authController.js';

const router = express.Router();
const upload = multer(); // in-memory

router.post('/register', upload.single('avatar'), registerUser);
router.post('/login', login);

export default router;