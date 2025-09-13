import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Avatar from '../models/avatar.js';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { identifiant, motDePasse } = req.body;

  if (!identifiant || !motDePasse) {
    return res.status(400).json({ message: 'Email et mot de passe requis.' });
  }

  try {
    let user = await User.findOne({
      $or: [{ email: identifiant }, { pseudo: identifiant }]
    });
    let isAdmin = false;

    if (!user) {
      user = await Admin.findOne({
        $or: [{ email: identifiant }, { pseudo: identifiant }]
      });
      if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
      isAdmin = true;
    }

    if(user.isBlocked) {
      return res.status(403).json({ message: "Votre compte est bloqué. Contactez l'administrateur." });
    }

    const match = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!match) return res.status(401).json({ message: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id}, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: "Connexion réussie",
      token,
      pseudo: user.pseudo,
      isAdmin,
      role: user.role || 'user' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur interne du serveur" });
  }
};

export const registerUser = async (req, res) => {
  const {
      email, pseudo, motDePasse, nom, prenom, telephone, dateNaissance, sexe, adresse,avatar
    } = req.body;
    
  try {
    const existingUser = await User.findOne({ email });
    const existingAdmin = await Admin.findOne({ email });
    if (existingUser || existingAdmin) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const existingPseudo = await User.findOne({ pseudo });
    const existingAdminPseudo = await Admin.findOne({ pseudo });
    if (existingPseudo || existingAdminPseudo) {
      return res.status(400).json({ message: "Ce pseudo est déjà pris." });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    let avatarDoc = null;
    if (avatar) {
      avatarDoc = await Avatar.findById(avatar);
      if (!avatarDoc) {
        return res.status(400).json({ message: "L'avatar sélectionné est invalide." });
      }
    }

    const newUser = new User({ pseudo, email, motDePasse: hashedPassword,nom,
      prenom,
      telephone,
      dateNaissance,
      sexe,
      adresse: typeof adresse === 'string' ? JSON.parse(adresse) : adresse,
      avatar: avatarDoc?._id });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: "Compte créé avec succès",
      token,
      pseudo: newUser.pseudo,
      isAdmin: false
    });

  } catch (error) {
    res.status(500).json({ message: "Erreur serveur : " + error.message });
  }
};
