import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret'); // Assure-toi du bon secret
    const user = await User.findById(decoded.id).select('_id email pseudo'); // récupère au moins _id

    if (!user) {
      return res.status(401).json({ message: 'Utilisateur non trouvé' });
    }

    req.user = user; // ⬅️ Ceci est essentiel
    next();
  } catch (err) {
    console.error('Erreur authMiddleware:', err);
    return res.status(403).json({ message: 'Token invalide' });
  }
};

export default authMiddleware;
