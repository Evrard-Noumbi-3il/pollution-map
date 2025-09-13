import mongoose from 'mongoose';

const avatarSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  image: {
    contenu: { type: Buffer, required: true },
    mimetype: { type: String, required: true }
  }
});

export default mongoose.model('Avatar', avatarSchema);
