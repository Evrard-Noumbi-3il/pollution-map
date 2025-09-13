import express from 'express';
import { getStatistiques, getReportStats, getAdminProfile } from '../controllers/adminController.js';
import auth  from '../middlewares/auth.js';
import { getAllUsers, blockUser, unblockUser, deleteUser, getReportsByUser,getEvaluation, getAllReports, getUserStats, getUsersParStatut,getTopUtilisateursParPoints, getDistributionNotes } from '../controllers/adminController.js';
import { verifieTokenAdmin } from '../middlewares/authAdmin.js';

const router = express.Router();

// Accès restreint aux administrateurs
router.get('/statistiques', auth, getStatistiques);
router.get('/utilisateurs', auth, getAllUsers);
router.put('/users/:id/bloquer', blockUser);
router.put('/users/:id/debloquer', unblockUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/reports', getReportsByUser);
router.get('/evaluation', auth, getEvaluation);
router.get("/statistiques/reports", auth, getReportStats);
router.get('/all-reports', auth, getAllReports);
router.get('/statistiques/utilisateurs', auth, getUserStats);
router.get('/utilisateurs/statut',auth, getUsersParStatut);
router.get('/utilisateurs/top-points', auth, getTopUtilisateursParPoints);
router.get('/statistiques/notes/distribution', auth, getDistributionNotes);
router.get('/profile', verifieTokenAdmin, getAdminProfile);

export default router;
