import Admin from '../models/Admin.js';
import Avatar from '../models/avatar.js';
import bcrypt from 'bcrypt';

// 🔍 Liste tous les modérateurs
export const getModerateurs = async (req, res) => {
  try {
    const moderateurs = await Admin.find({ role: 'moderateur' }).select('-motDePasse');
    res.json(moderateurs);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des modérateurs." });
  }
};

// ➕ Crée un modérateur
export const createModerateur = async (req, res) => {
  try {
    const {
      pseudo,
      email,
      motDePasse,
      nom,
      prenom,
      telephone,
      dateNaissance,
      sexe,
      adresse
    } = req.body;

    if (!pseudo || !email || !motDePasse) {
      return res.status(400).json({ message: "Champs obligatoires manquants." });
    }

    const defaultAvatar = await Avatar.findOne({ nom: "Admin.png" });
    if (!defaultAvatar) {
      return res.status(500).json({ message: "Avatar par défaut 'Admin' introuvable." });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Un compte avec cet email existe déjà." });
    }

    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const nouveauModerateur = new Admin({
      pseudo,
      email,
      motDePasse: hashedPassword,
      nom,
      prenom,
      telephone,
      dateNaissance,
      sexe,
      avatar: defaultAvatar._id,
      role: 'moderateur',
      adresse: {
        rue: adresse?.rue || '',
        ville: adresse?.ville || '',
        codePostal: adresse?.codePostal || '',
        pays: adresse?.pays || ''
      }
    });

    await nouveauModerateur.save();
    res.status(201).json({ message: "Modérateur créé avec succès." });
  } catch (err) {
    console.error("Erreur création modérateur:", err);
    res.status(500).json({ message: "Erreur lors de la création du modérateur." });
  }
};

// ✏️ Mise à jour des infos d’un modérateur
export const updateModerateur = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    delete updates.motDePasse;
    delete updates.email; // empêcher changement email ici

    const updated = await Admin.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ message: "Modérateur non trouvé." });

    res.json({ message: "Modérateur mis à jour." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
};

// ❌ Supprimer un modérateur
export const deleteModerateur = async (req, res) => {
  try {
    const { id } = req.params;
    await Admin.findByIdAndDelete(id);
    res.json({ message: "Modérateur supprimé." });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};

// ⛔ Bloquer ou débloquer
export const toggleBlockModerateur = async (req, res) => {
  try {
    const { id } = req.params;
    const moderateur = await Admin.findById(id);
    if (!moderateur) return res.status(404).json({ message: "Modérateur introuvable." });

    moderateur.isBlocked = !moderateur.isBlocked;
    await moderateur.save();

    res.json({ message: `Modérateur ${moderateur.isBlocked ? 'bloqué' : 'débloqué'}.` });
  } catch (err) {
    res.status(500).json({ message: "Erreur de blocage." });
  }
};

// 🔄 Changer le rôle (par ex. le passer à admin)
export const changeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { nouveauRole } = req.body;
    if (!['moderateur', 'admin'].includes(nouveauRole)) {
      return res.status(400).json({ message: "Rôle invalide." });
    }

    const admin = await Admin.findById(id);
    if (!admin) return res.status(404).json({ message: "Utilisateur non trouvé." });

    admin.role = nouveauRole;
    await admin.save();

    res.json({ message: `Rôle mis à jour vers ${nouveauRole}` });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du changement de rôle." });
  }
};
