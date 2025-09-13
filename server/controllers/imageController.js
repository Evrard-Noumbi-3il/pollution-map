import mongoose from 'mongoose';
import Image from '../models/image.js';

export const getImageByReportId = async (req, res) => {
  try {
    const reportId = new mongoose.Types.ObjectId(req.params.reportId); // <- conversion ici

    if (!mongoose.Types.ObjectId.isValid(req.params.reportId)) {
      return res.status(400).send('ID invalide');
    }

    const image = await Image.findOne({ report: reportId });
    if (!image) return res.status(404).send('Image non trouvée');

    res.set('Content-Type', image.mimetype);
    res.send(image.contenu);
  } catch (error) {
    console.error('Erreur lors du chargement de l’image :', error);
    res.status(500).send('Erreur serveur');
  }
};
