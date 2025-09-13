import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Avatar from '../models/avatar.js';
import NoteReport from '../models/NoteReport.js';

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      nom,
      prenom,
      pseudo,
      email,
      telephone,
      dateNaissance,
      sexe,
      adresse,
      avatar,
    } = req.body;

    // Vérifie si l'avatar existe
    let avatarDoc = null;
    if (avatar) {
      avatarDoc = await Avatar.findById(avatar);
      if (!avatarDoc) {
        return res.status(400).json({ message: "Avatar invalide" });
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        nom,
        prenom,
        pseudo,
        email,
        telephone,
        dateNaissance,
        sexe,
        adresse,
        avatar: avatarDoc?._id,
      },
      { new: true }
    ).populate('avatar');

    res.json(updated);

  } catch (err) {
    console.error('Erreur update profile:', err);
    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
};

export const getProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user.id)
      .populate('avatar')
      .lean(); // lean() pour retourner un objet JS simple

    if (!user){
      user = await Admin.findById(req.user.id)
        .populate('avatar')
        .lean();
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    }
   // Si l'avatar est en buffer, on le convertit pour l'affichage
    if (user.avatar && user.avatar.image?.contenu) {
      user.avatar.image.contenu = user.avatar.image.contenu.toString('base64');
    }

    res.json(user);
  } catch (err) {
    console.error('Erreur chargement profil :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// controllers/userController.js

export const toggleFavori = async (req, res) => {
  const userId = req.user.id;
  const { reportId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    const index = user.favoris.indexOf(reportId);
    if (index === -1) {
        user.favoris.push(reportId); // Ajoute aux favoris
      } else {
        user.favoris.splice(index, 1); // Retire des favoris
      }

    await user.save();
    res.status(200).json({ favoris: user.favoris });
  } catch (error) {
    console.error("Erreur toggle favori :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getFavoris = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favoris');
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.status(200).json(user.favoris);
  } catch (err) {
    console.error("Erreur lors de la récupération des favoris :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


export const getUserNotes = async (req, res) => {
  const userId = req.user.id;

  try {
    const notes = await NoteReport.find({ user: userId })
      .populate('report', 'description date status')
      .select('note commentaire report');

    res.status(200).json(notes);
  } catch (error) {
    console.error("Erreur récupération des notes utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
