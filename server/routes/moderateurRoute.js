import express from 'express';
import {
  getModerateurs,
  createModerateur,
  updateModerateur,
  deleteModerateur,
  toggleBlockModerateur,
  changeRole
} from '../controllers/adminModerateurController.js';

const router = express.Router();

router.get('/', getModerateurs);
router.post('/', createModerateur);
router.patch('/:id', updateModerateur);
router.delete('/:id', deleteModerateur);
router.patch('/:id/block', toggleBlockModerateur);
router.patch('/:id/role', changeRole);

export default router;
