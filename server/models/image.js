import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  contenu: { type: Buffer, required: true },
  mimetype: { type: String, required: true },
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true }
});

export default mongoose.model('Image', imageSchema);
