import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  description: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  date: { type: Date, default: Date.now },
  status: { type: String,enum: ['en attente','validé', 'en cours', 'résolu','annulé'], default: 'en attente' },  
  gravite: { type: Number,enum: [1, 2, 3, 4, 5], default: 1 },
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'Type', required: true },
  evaluation: {
    note: { type: Number, default: 0, min: 0, max: 100 },
    nombre: { type: Number, default: 0 }
  },
  noteCouleur: { type: String, default: 'rouge' }, // rouge, orange, jaune, vert
  notePrecedente: { type: Number, default: 0 } 
});

export default mongoose.model('Report', reportSchema);
