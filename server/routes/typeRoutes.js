import express from 'express';
import { getTypes, updateType, deleteType, createType } from '../controllers/typeController.js';

const router = express.Router();

router.get('/', getTypes);
router.put('/:id', updateType);
router.delete('/:id', deleteType);
router.post('/', createType); // Ajout de la route pour créer un type

export default router;
