// Import des modules
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import typeRoutes from './routes/typeRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import userRoutes from './routes/userRoutes.js'
import imageRoutes from './routes/imageRoutes.js';
import notesRoutes from './routes/noteReportRoute.js'
import avatarRoutes from './routes/avatarRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js';
import moderateurRoute from './routes/moderateurRoute.js';

dotenv.config()

// Création de l'application Express
const app = express();
const PORT = process.env.PORT || 5000;

// Connexion DB
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Route test
app.use('/api/auth', authRoutes)
app.use('/api/types', typeRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/users', userRoutes)
app.use('/api/images', imageRoutes);
app.use( notesRoutes);
app.use('/api/avatars', avatarRoutes)
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/moderateur', moderateurRoute);

app.get('/', (req, res) => {
  res.send(' API de signalement de pollution');
});

// Lancement du serveur
app.listen(PORT ,'0.0.0.0', () => {
  console.log(' Serveur démarré sur http://localhost:${PORT}');
});