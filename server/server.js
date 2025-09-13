import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import typeRoutes from './routes/typeRoutes.js'
import reportRoutes from './routes/reportRoutes.js'
import userRoutes from './routes/userRoutes.js'
import imageRoutes from './routes/imageRoutes.js';
import notesRoutes from './routes/noteReportRoute.js'
import avatarRoutes from './routes/avatarRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// 🔗 Routes API
app.use('/api/auth', authRoutes)
app.use('/api/types', typeRoutes)
app.use('/api/reports', reportRoutes)
app.use('/api/users', userRoutes)
app.use('/api/images', imageRoutes);
app.use( notesRoutes);
app.use('/api/avatars', avatarRoutes)
app.use('/img', express.static(path.join(__dirname, 'img'))); // pour /img/icons/*

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/pollution-map', ).then(() => {
  console.log('✅ Connecté à MongoDB')
  app.listen(5000, () => console.log('✅ Serveur démarré sur le port 5000'))
}).catch(err => {
  console.error('❌ Erreur de connexion MongoDB :', err)
})

// Route fallback
app.get('/', (req, res) => {
  res.send('🚀 API Pollution Map en ligne')
})

// Démarrer le serveur
app.listen(PORT,'0.0.0.0', () => {
  console.log(`🌍 Serveur en cours sur http://localhost:${PORT}`)
})
