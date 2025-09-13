import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const verifieTokenAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Token manquant" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).populate('avatar');

    if (!admin) return res.status(401).json({ message: "Admin non trouvé" });

    req.admin = admin;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      console.warn("Token expiré:", err.expiredAt);
      return res.status(401).json({ message: "Le token a expiré. Veuillez vous reconnecter." });
    }

    console.error("Erreur de vérification du token:", err.message);
    res.status(401).json({ message: "Token invalide" });
  }
};
