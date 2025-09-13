import mongoose from 'mongoose';
import Report from '../models/report.js';
import Type from '../models/Type.js';
import Image from '../models/image.js';
import User from '../models/User.js'; 

function getNoteColor(note) {
  if (note >= 80) return 'vert';
  if (note >= 60) return 'jaune';
  if (note >= 40) return 'orange';
  if (note === 0 || note === null) return 'gris';
  return 'rouge';
}

export const createReport = async (req, res) => { 
  try {
    const { description, gravite, type, coordinates, nouveauType } = JSON.parse(req.body.data || '{}'); 
    const file = req.file;

    if (!type) return res.status(400).json({ message: 'Type requis.' });
    if (!description) return res.status(400).json({ message: 'Description requise.' });
    if (!gravite) return res.status(400).json({ message: 'Gravité requise.' });
    if (!coordinates || !coordinates.lat || !coordinates.lng)
      return res.status(400).json({ message: 'Coordonnées complètes requises (lat, lng).' });

    let typeIdToUse;

    // 🔁 Si l'utilisateur choisit "autre", on crée un nouveau type
    if (type === 'autre') {
      if (!nouveauType || !nouveauType.trim()) {
        return res.status(400).json({ message: 'Nom du nouveau type requis.' });
      }

      // Vérifie si un type portant ce nom existe déjà
      let existingType = await Type.findOne({ nom: nouveauType.trim() });

      if (!existingType) {
        const nouveau = new Type({
          nom: nouveauType.trim(),
          image: '/img/icons/new.png' // ou une valeur par défaut
        });
        const savedType = await nouveau.save();
        typeIdToUse = savedType._id;
      } else {
        typeIdToUse = existingType._id;
      }
    } 
    else {
      // Sinon, on vérifie que l'ID du type est valide
      if (!mongoose.Types.ObjectId.isValid(type)) {
        return res.status(400).json({ message: 'Type de pollution invalide.' });
      }

      const typeExists = await Type.findById(type);
      if (!typeExists) {
        return res.status(404).json({ message: 'Type de pollution non trouvé.' });
      }

      typeIdToUse = type;
    }

    // ✅ Création du report
    const newReport = new Report({
      description,
      coordinates,
      gravite,
      type: typeIdToUse,
      date: new Date(),
      status: 'en attente',
      utilisateur: req.user.id
    });

    const savedReport = await newReport.save();

    // ✅ Attribution de points
    const user = await User.findById(req.user.id);
    if (user) {
      user.points.push({
        valeur: 20,
        raison: 'Création de report',
        date: new Date()
      });
      await user.save();
      await user.updateStatut();
    }

    // ✅ Gestion de l'image
    if (file) {
      const newImage = new Image({
        nom: file.originalname,
        contenu: file.buffer,
        mimetype: file.mimetype,
        report: savedReport._id
      });
      await newImage.save();
    }

    res.status(201).json(savedReport);

  } catch (error) {
    console.error('Erreur création report:', error);
    res.status(500).json({ message: 'Erreur lors de la création du signalement.' });
  }
};


export const getReports = async (req, res) => {
  try {
    let reports = await Report.find({ status: {$nin: ['annulé', 'résolu']} })
      .populate('type')
      .lean();

      const completeReports = reports.filter(report => report.type);
      reports = completeReports;
    // Ajouter l'image associée à chaque report
    const reportsWithImages = await Promise.all(reports.map(async report => {
      const image = await Image.findOne({ report: report._id }).lean();
      return {
        ...report,
        image: image ? {
          nom: image.nom,
          contenu: image.contenu.toString('base64'),
          mimetype: image.mimetype
        } : null
      };
    }));

    res.json(reportsWithImages);
  } catch (err) {
    console.error('Erreur getReports:', err);
    res.status(500).json({ message: "Erreur lors de la récupération des signalements." });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    //console.log("Tentative de suppression du report avec l'ID :", id);
    
    await Image.deleteOne({ report: id });

    const report = await Report.findById(id);
    if(report.evaluation.note === 0 || report.evaluation.nombre === 0 ||report.evaluation.nombre <= 10){
     // Attribution de points
      const user = await User.findById(report.utilisateur);
      if (user) {
        const delta = getNoteColor(report.evaluation.note) === 'gris' ? -20 : -30;
        user.points.push({
          valeur: delta,
          raison: `report supprimé n'ayant pas rempli les conditions d'évaluation`
        });
        await user.save();
      }
      await user.updateStatut();

    }
    const deleted = await Report.findByIdAndDelete(id);

    if (!deleted) {
      console.log("Aucun report trouvé avec cet ID");
      return res.status(404).json({ message: "Report non trouvé." });
    }

    //console.log("Report supprimé avec succès");
    res.json({ message: "Report supprimé avec succès." });
  } catch (err) {
    console.error("Erreur suppression report:", err);
    res.status(500).json({ message: "Erreur lors de la suppression du report." });
  }
};

export const getReportImage = async (req, res) => {
  try {
    const image = await Image.findOne({ report: req.params.id });

    if (!image) {
      return res.status(404).json({ message: 'Image non trouvée pour ce signalement.' });
    }

    res.set('Content-Type', image.mimetype);
    res.send(image.contenu);
  } catch (err) {
    console.error("Erreur récupération image:", err);
    res.status(500).json({ message: 'Erreur lors de la récupération de l’image.' });
  }
};

export const getReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Chercher le report avec son type peuplé
    const report = await Report.findById(id).populate('type').lean();

    if (!report || !report.type) {
      return res.status(404).json({ message: "Report non trouvé ou type manquant." });
    }

    // Chercher l'image liée à ce report
    const image = await Image.findOne({ report: report._id }).lean();

    const reportWithImage = {
      ...report,
      image: image
        ? {
            nom: image.nom,
            contenu: image.contenu.toString('base64'),
            mimetype: image.mimetype
          }
        : null
    };

    res.json(reportWithImage);
  } catch (err) {
    console.error("Erreur getReport:", err);
    res.status(500).json({ message: "Erreur lors de la récupération du signalement." });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer le report
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report non trouvé" });
    }

    // Mise à jour des champs du report
    report.description = req.body.description;
    report.gravite = parseInt(req.body.gravite, 10);
    report.type = req.body.type;
    report.coordinates = {
      lat: parseFloat(req.body.lat),
      lng: parseFloat(req.body.lng),
    };

    //console.log("BODY:", req.body);
    //console.log("FILE:", req.file);

    await report.save();

    // S'il y a une nouvelle image, la sauvegarder ou la remplacer
    if (req.file) {
      const existingImage = await Image.findOne({ report: report._id });
      const newImageData = {
        nom: req.file.originalname,
        contenu: req.file.buffer,
        mimetype: req.file.mimetype,
        report: report._id,
      };
      // Supprimer l’image si demandé
        if (req.body.removeImage === "true") {
          await Image.deleteOne({ report: report._id });
        }

      if (existingImage) {
        await Image.updateOne({ report: report._id }, newImageData);
      } else {
        await Image.create(newImageData);
      }
    }

    res.json({ message: "Report mis à jour avec succès" });

  } catch (error) {
    console.error("Erreur de mise à jour :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};

export const updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    console.log("Tentative de mise à jour du statut du report :", id, "vers", status);
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report non trouvé." });
    }

    // Vérifie s’il y a un vrai changement
    if (report.status === status) {
      return res.status(200).json({ message: "Aucun changement de statut." });
    }

    // Met à jour le statut
    if(report.status === 'en attente'){
      const previousStatus = report.status;
      report.status = status;
      // Attribution de points
      const user = await User.findById(report.utilisateur);
      if (user) {
        user.points.push({
          valeur: 50,
          raison: `Changement de statut: ${previousStatus} → ${status}`
        });
        await user.save();
        await user.updateStatut();
      }
       await report.save();
    }else{
      report.status = status;
      await report.save();
    }
    
    res.status(200).json({ message: "Statut mis à jour avec succès." });
  } catch (err) {
    console.error("Erreur update statut report:", err);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du statut." });
  }
};


export const updateReportStatusAnnuler = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { status: 'annulé' },
      { new: true }
    );

    // Attribution de points
      const user = await User.findById(updatedReport.utilisateur);
      if (user) {
        user.points.push({
          valeur: -50,
          raison: `report annulé`
        });
        await user.save();
        await user.updateStatut();
      }

    if (!updatedReport) {
      return res.status(404).json({ message: "Signalement non trouvé." });
    }

    res.status(200).json(updatedReport);
  } catch (err) {
    console.error("Erreur lors de la mise à jour du statut :", err);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
// GET /api/reports/my
export const getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ utilisateur: req.user._id })
      .populate('type') // si tu veux inclure les détails du type
      .sort({ date: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};
