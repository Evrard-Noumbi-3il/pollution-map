import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pseudo: { type: String, required: true },
  motDePasse: String,
  nom: String,
  prenom: String,
  telephone: String,
  dateNaissance: Date,
  sexe: String,
  statut: {
    type: String,
    enum: ['Inconnu', 'Débutant','Actif', 'Fiable', 'Très fiable', 'Vérifié'],
    default: 'Inconnu'
  },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
  },
  avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Avatar' },
  points: [{
    valeur: Number,
    raison: String,
    date: { type: Date, default: Date.now }
  }],
  favoris: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  isBlocked: { type: Boolean, default: false }
},{ timestamps: true }
);

userSchema.methods.updateStatut = async function () {
  const totalPoints = this.points.reduce((sum, p) => sum + p.valeur, 0);

  let newStatut = 'Inconnu';
  if (totalPoints >= 1500) newStatut = 'Vérifié';
  else if (totalPoints >= 1000) newStatut = 'Très fiable';
  else if (totalPoints >= 300) newStatut = 'Fiable';
  else if (totalPoints >= 100) newStatut = 'Actif';
  else if (this.points.length > 0) newStatut = 'Débutant';

  if (this.statut !== newStatut) {
    this.statut = newStatut;
    return this.save(); // Important pour sauvegarder le changement
  }

  return Promise.resolve(this); // Pas de changement, on retourne l'utilisateur
};

export default mongoose.model('User', userSchema);
