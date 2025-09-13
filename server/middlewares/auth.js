import jwt from 'jsonwebtoken';

// Remplace par ta vraie clé secrète (à stocker idéalement dans un .env)
const SECRET_KEY = 'ma_clé_ultra_secrète_123';

export default function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // contient userId, isAdmin, etc.
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token invalide ou expiré.' });
  }
}

