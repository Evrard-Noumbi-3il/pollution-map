// controllers/noteController.js
import NoteReport from '../models/NoteReport.js';
import Report from '../models/report.js';
import User from '../models/User.js';

function getNoteColor(note) {
  if (note >= 80) return 'vert';
  if (note >= 60) return 'jaune';
  if (note >= 40) return 'orange';
  if (note === 0 || note === null) return 'gris';
  return 'rouge';
}

// ➕ Créer une note
export const createNote = async (req, res) => {
  const { note, commentaire, report } = req.body;
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Utilisateur non authentifié." });
  }

  //console.log("Création de note pour l'utilisateur:", userId, "sur le report:", report);

  try {
    const existingNote = await NoteReport.findOne({ report, user: userId });
    if (existingNote) {
      return res.status(400).json({ message: "Vous avez déjà noté ce signalement.", alreadyRated: true });
    }

    const newNote = new NoteReport({ note, commentaire, report, user: userId });
    await newNote.save();

    const reportDoc = await Report.findById(report);

    // ✅ Correction ici : on utilise `report` au lieu de `reportId`
    const notes = await NoteReport.find({ report });
    const total = notes.reduce((sum, n) => sum + n.note, 0);
    const moyenne = total / notes.length;
    const evaluation = {
      note: Math.round((moyenne / 5) * 100), // sur 100
      nombre: notes.length
    };

    // Mise à jour de la couleur de la note
    const oldNote = reportDoc.evaluation?.note || 0;
    const oldColor = reportDoc.noteCouleur || getNoteColor(oldNote);
    const newColor = getNoteColor(evaluation.note);
    const utilisateurId = reportDoc.utilisateur;

    await Report.findByIdAndUpdate(report, { evaluation });

    reportDoc.evaluation = {
      note: evaluation.note,
      nombre: notes.length
    };
    reportDoc.notePrecedente = oldNote;
    reportDoc.noteCouleur = newColor;
    await reportDoc.save();

    const user = await User.findById(utilisateurId);

    if (!user) {
      console.warn("Utilisateur du report introuvable.");
    } else {
      function ajouterPoints(valeur, raison) {
        user.points.push({ valeur, raison });
      }

      // Attribution de points
            const utilisateur = await User.findById(userId);
            if (utilisateur) {
              utilisateur.points.push({
                valeur: 2,
                raison: `évaluation d'un signalement`,
              });
              await utilisateur.save();
              await utilisateur.updateStatut();
            }
    // 1. +10 pour chaque note postée → déjà fait au moment de la création du signalement ailleurs

    // 2. Changement de couleur
    if (oldColor !== newColor) {
      const delta = evaluation.note > oldNote ? 10 : -10;
      ajouterPoints(delta, `Changement de couleur : ${oldColor} → ${newColor}`);
    }

    // 3. Note parfaite = 100
    if (evaluation === 100 && oldNote < 100) {
      ajouterPoints(10, 'Note parfaite atteinte');
    }

    await user.save();
    await user.updateStatut();

  }
    res.status(201).json(newNote);
  } catch (err) {
    console.error("Erreur lors de l'enregistrement de la note :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};



// 📄 Récupérer les notes d’un report
export const getNotesByReport = async (req, res) => {
  const { reportId } = req.params;

  try {
    const notes = await NoteReport.find({ report: reportId })
      .populate("user", "pseudo email") // Pour afficher l'auteur
      .sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (err) {
    console.error("Erreur récupération des notes :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

// ✅ Vérifier si l'utilisateur a déjà noté
export const hasUserRated = async (req, res) => {
  const { reportId} = req.params;
    const userId = req.user.id;
  // 🔐 Validation des IDs
  if (!mongoose.Types.ObjectId.isValid(reportId) || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "ID invalide." });
  }

  try {
    const note = await NoteReport.findOne({ report: reportId, user: userId });
    res.status(200).json({ hasRated: !!note });
  } catch (err) {
    console.error("Erreur vérification note unique :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
