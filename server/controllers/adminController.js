import mongoose from 'mongoose';
import Report from '../models/report.js';
import User from '../models/User.js';
import Type from '../models/Type.js';
import Note from '../models/NoteReport.js';
import Image from '../models/image.js';

export const getAdminProfile = async (req, res) => {
  try {
    const admin = req.admin; // injecté depuis le middleware verifieTokenAdmin
    if (!admin) return res.status(404).json({ message: "Admin non trouvé" });

    res.json({
      id: admin._id,
      pseudo: admin.pseudo,
      email: admin.email,
      role: admin.role,
      avatar: admin.avatar,
      nom: admin.nom,
      prenom: admin.prenom
    });
  } catch (error) {
    console.error("Erreur profil admin:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getStatistiques = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const totalUsers = await User.countDocuments();
    const enAttente = await Report.countDocuments({ status: 'en attente' });
    const valides = await Report.countDocuments({ status: 'validé' });
    const annules = await Report.countDocuments({ status: 'annulé' });
    const types = await Type.countDocuments();

    const notes = await Note.find();
    const totalNote = notes.reduce((sum, note) => sum + note.note, 0);
    const moyenneEvaluation = notes.length ? totalNote / notes.length : 0;

    res.json({
      totalReports,
      totalUsers,
      enAttente,
      valides,
      annules,
      types,
      moyenneEvaluation
    });
  } catch (err) {
    console.error("Erreur récupération stats admin:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Sélection des champs utiles
    res.json(users);
  } catch (err) {
    console.error("Erreur récupération utilisateurs:", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// 🔹 Bloquer un utilisateur
export const blockUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    user.isBlocked = true;  // Champ que tu dois ajouter dans le modèle si non existant
    await user.save();

    res.status(200).json({ message: "Utilisateur bloqué avec succès." });
  } catch (error) {
    console.error("Erreur lors du blocage :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


// 🔹 Débloquer un utilisateur
export const unblockUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé." });

    user.isBlocked = false;  // Champ que tu dois ajouter dans le modèle si non existant
    await user.save();

    res.status(200).json({ message: "Utilisateur débloqué avec succès." });
  } catch (error) {
    console.error("Erreur lors du blocage :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // 1. Récupérer les reports de l'utilisateur
    const reports = await Report.find({ utilisateur: userId });
    const reportIds = reports.map(r => r._id);

    // 2. Supprimer les notes liées aux reports
    await Note.deleteMany({ report: { $in: reportIds } });

    // 3. Supprimer les images liées aux reports
    await Image.deleteMany({ report: { $in: reportIds } });

    // 4. Supprimer les reports
    await Report.deleteMany({ utilisateur: userId });

    // 5. Supprimer les notes faites par l'utilisateur
    await Note.deleteMany({ utilisateur: userId });

    // 6. Supprimer l'utilisateur
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Utilisateur et ses données supprimés avec succès." });
  } catch (err) {
    console.error("Erreur suppression utilisateur :", err);
    res.status(500).json({ message: "Erreur lors de la suppression." });
  }
};

// 🔹 Voir tous les reports d'un utilisateur
export const getReportsByUser = async (req, res) => {
  try {
    console.log("ID utilisateur reçu :", req.params.id);
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "ID invalide." });

    const reports = await Report.find({ utilisateur: req.params.id }).populate("type");
    res.json(reports);
  } catch (err) {
    console.error("Erreur lors de la récupération des reports utilisateur :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
}; 


export const getEvaluation = async (req, res) => {
  try {
    // Nombre total de notes
    const totalNotes = await Note.countDocuments();
    console.log("Total des notes :", totalNotes);

    // Nombre de reports par type
    const reportsParType = await Report.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "types",
          localField: "_id",
          foreignField: "_id",
          as: "typeDetails"
        }
      },
      { $unwind: "$typeDetails" },
      {
        $project: {
          type: "$typeDetails.nom",
          count: 1
        }
      }
    ]);
    console.log("Reports par type :", reportsParType);

    // Moyenne des évaluations par type
    const moyennesParType = await Report.aggregate([
      {
        $match: {
          "evaluation.note": { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$type",
          moyenneNote: { $avg: "$evaluation.note" }
        }
      },
      {
        $lookup: {
          from: "types",
          localField: "_id",
          foreignField: "_id",
          as: "typeDetails"
        }
      },
      { $unwind: "$typeDetails" },
      {
        $project: {
          type: "$typeDetails.nom",
          moyenneNote: { $round: ["$moyenneNote", 2] }
        }
      }
    ]);
    console.log("Moyennes par type :", moyennesParType);

    res.json({
      totalNotes,
      reportsParType: reportsParType || [],
      moyennesParType: moyennesParType || []
    });
  } catch (err) {
    console.error("Erreur statistiques :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getReportStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();

    const periode = req.query.periode || 'jour'; // 'jour', 'semaine', 'mois'

    let format;
    switch (periode) {
      case 'mois':
        format = '%Y-%m';
        break;
      case 'semaine':
        format = '%Y-%U'; // année + semaine
        break;
      case 'jour':
      default:
        format = '%Y-%m-%d';
        break;
    }

    const reportsParType = await Report.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "types",
          localField: "_id",
          foreignField: "_id",
          as: "typeInfo"
        }
      },
      { $unwind: "$typeInfo" },
      { $project: { type: "$typeInfo.nom", count: 1 } }
    ]);

    const reportsParStatut = await Report.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { status: "$_id", count: 1, _id: 0 } }
    ]);

    const reportsParGravite = await Report.aggregate([
      { $group: { _id: "$gravite", count: { $sum: 1 } } },
      { $project: { gravite: "$_id", count: 1, _id: 0 } },
      { $sort: { gravite: 1 } }
    ]);

    const evolutionReports = await Report.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: 1
            }
          },
          count: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    const evolutionReportsDay = await Report.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format, date: "$date" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);


    const coordinatesList = await Report.find({}, "coordinates");

    res.json({
      totalReports,
      reportsParType,
      reportsParStatut,
      reportsParGravite,
      evolutionReports,
      evolutionReportsDay,
      coordinatesList
    });
  } catch (err) {
    console.error("Erreur getReportStats :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({}, "coordinates").lean().populate('type', 'nom'); // Ne renvoie que les coordonnées
    res.json(reports);
  } catch (err) {
    console.error("Erreur récupération reports :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const periode = req.query.periode || 'mois'; // par défaut "mois"

    let format;
    switch (periode) {
      case 'jour':
        format = "%Y-%m-%d";
        break;
      case 'semaine':
        format = "%Y-%U"; // année + numéro de semaine
        break;
      case 'mois':
      default:
        format = "%Y-%m";
        break;
    }

    const evolutionInscriptions = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: format, date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          periode: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({ evolutionInscriptions });
  } catch (err) {
    console.error("Erreur stats utilisateurs :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};


export const getUsersParStatut = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $group: {
          _id: "$statut",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          statut: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);
    res.json(result);
  } catch (err) {
    console.error("Erreur récupération des utilisateurs par statut :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getTopUtilisateursParPoints = async (req, res) => {
  try {
    const utilisateurs = await User.find().lean();

    const top = utilisateurs
      .map((user) => {
        const total = (user.points || []).reduce((sum, p) => sum + (p.valeur || 0), 0);
        return { pseudo: user.pseudo, totalPoints: total };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 10); // top 10

    res.json(top);
  } catch (err) {
    console.error("Erreur top utilisateurs :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

export const getDistributionNotes = async (req, res) => {
  try {
    const distribution = await Note.aggregate([
      {
        $group: {
          _id: "$note",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    res.json({ distribution });
  } catch (err) {
    console.error("Erreur récupération distribution des notes :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};