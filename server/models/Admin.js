import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  pseudo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  nom: String,
  prenom: String,
  telephone: String,
  dateNaissance: Date,
  sexe: String,
  role: {
      type: String,
      enum: ['admin', 'moderateur'],
      default: 'moderateur'
    },
    adresse: {
      rue: String,
      ville: String,
      codePostal: String,
      pays: String
    },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Avatar' },
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  isBlocked: { type: Boolean, default: false }
},{ collection: 'admins' });

const Admin = mongoose.model('Admin', adminSchema);
export default Admin;
