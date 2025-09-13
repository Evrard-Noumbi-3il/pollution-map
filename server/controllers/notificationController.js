import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const envoyerNotification = async (req, res) => {
  try {
    const { titre, message, cibleUtilisateur, cibleStatut, seuilPoints, pourTous } = req.body;

    if (!titre || !message) {
      return res.status(400).json({ error: 'Titre et message requis.' });
    }

    const util = await User.findOne({ pseudo: cibleUtilisateur });
    const notification = new Notification({
      titre,
      message,
      cibleUtilisateur: util._id || null,
      cibleStatut: cibleStatut || null,
      seuilPoints: seuilPoints ?? null,
      pourTous: pourTous || false
    });

    await notification.save();

    let destinataires = [];

    if (pourTous) {
      destinataires = await User.find({});
    } else if (cibleUtilisateur) {
      const user = await User.findOne({ pseudo: cibleUtilisateur });
      console.log("Utilisateur cible :", user.pseudo ,"avec ID :", user._id);
      if (user) destinataires.push(user._id);
      else {
        return res.status(404).json({ error: 'Utilisateur cible non trouvé.' });
      }
    } else if (cibleStatut) {
      destinataires = await User.find({ statut: cibleStatut });
    } else if (seuilPoints != null) {
      const allUsers = await User.find({});
      destinataires = allUsers.filter(user => {
        const totalPoints = user.points.reduce((sum, p) => sum + p.valeur, 0);
        return totalPoints >= seuilPoints;
      });
    }

    for (let user of destinataires) {
        // Si user est un ObjectId, on récupère son document
        if (!user.notifications) {
            user = await User.findById(user);
        }

        if (!user) continue;

        if (!user.notifications.map(n => n.toString()).includes(notification._id.toString())) {
            user.notifications.push(notification._id);
            await user.save();
        }
        }

    return res.status(201).json({ message: 'Notification envoyée avec succès.' });
  } catch (err) {
    console.error("Erreur notification :", err);
    res.status(500).json({ error: "Erreur lors de l'envoi de la notification." });
  }
};

// controllers/notificationController.js
export const getMesNotifications = async (req, res) => {
  try {
    const utilisateur = req.utilisateur; // récupéré par le middleware d'auth
    const utilisateurComplet = await User.findById(utilisateur._id)
      .populate('notifications')
      .lean();

    if (!utilisateurComplet) {
      return res.status(404).json({ error: "Utilisateur introuvable" });
    }

    res.json(utilisateurComplet.notifications.reverse()); // plus récentes en premier
  } catch (err) {
    console.error("Erreur récupération notifications :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getNotificationById = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const utilisateur = req.utilisateur;

    if (!utilisateur || !utilisateur._id) {
      return res.status(401).json({ error: 'Non autorisé.' });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification introuvable.' });
    }

    // Vérifie que l'utilisateur est bien destinataire
    const estDestinataire =
      notification.pourTous ||
      (notification.cibleUtilisateur?.toString() === utilisateur._id.toString()) ||
      (notification.cibleStatut && notification.cibleStatut === utilisateur.statut) ||
      (notification.seuilPoints != null &&
        utilisateur.points.reduce((sum, p) => sum + p.valeur, 0) >= notification.seuilPoints);

    if (!estDestinataire) {
      return res.status(403).json({ error: "Vous n'avez pas accès à cette notification." });
    }

    // Marquer comme lue si ce n'est pas déjà fait
    const dejaLu = notification.luPar.some(id => id.toString() === utilisateur._id.toString());
    if (!dejaLu) {
      notification.luPar.push(utilisateur._id);
      await notification.save();
    }

    res.status(200).json(notification);
  } catch (err) {
    console.error("Erreur récupération notification :", err);
    res.status(500).json({ error: "Erreur lors de la récupération de la notification." });
  }
};


