import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now },
  luPar: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  cibleUtilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  cibleStatut: {
    type: String,
    enum: ['Inconnu', 'Débutant', 'Actif', 'Fiable', 'Très fiable', 'Vérifié'],
    default: null
  },
  seuilPoints: { type: Number, default: null },
  pourTous: { type: Boolean, default: false },
  lusPar: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

export default mongoose.model('Notification', notificationSchema);
