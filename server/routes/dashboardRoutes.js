// server/routes/dashboardRoutes.js
import express from 'express';
const router = express.Router();
import auth from '../middlewares/auth.js';
import {
  getGeneralStats,
  getReportsByPeriod,
  getReportsByType,
  getReportsByGravity,
  getReportsByStatus,
  getGeographicAnalysis,
  getUserStats,
  getEvaluationStats,
  getFilterOptions
} from '../controllers/dashboardController.js';


// Toutes les routes sont protégées par l'authentification admin
router.use(auth);

// Statistiques générales
router.get('/general-stats',getGeneralStats);

// Signalements par période
router.get('/reports-by-period', getReportsByPeriod);

// Signalements par type
router.get('/reports-by-type',getReportsByType);

// Signalements par gravité
router.get('/reports-by-gravity',getReportsByGravity);

// Signalements par statut
router.get('/reports-by-status', getReportsByStatus);

// Analyse géographique
router.get('/geographic-analysis', getGeographicAnalysis);

// Statistiques utilisateurs
router.get('/user-stats', getUserStats);

// Analyse des évaluations
router.get('/evaluation-stats' , getEvaluationStats);

// Options pour les filtres
router.get('/filter-options', getFilterOptions);

export default router;