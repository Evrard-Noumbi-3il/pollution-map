import express from 'express'
import User from '../models/User.js'
import auth from '../middlewares/auth.js'
import { updateProfile, getProfile, toggleFavori, getFavoris,getUserNotes } from '../controllers/userController.js';

const router = express.Router()

// Liste des utilisateurs (admin seulement)
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-motDePasse') // Sans le mot de passe
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/profile — retourne le profil utilisateur avec avatar et points
router.get('/profile', auth, getProfile);
router.put('/me', auth, updateProfile);
router.put('/favoris/:reportId', auth, toggleFavori);
router.get('/favoris', auth, getFavoris);
router.get('/mes-notes', auth, getUserNotes);


export default router
