import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pollution-map';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connecté à MongoDB");

    const existingAdmin = await Admin.findOne({ email: "dan@dan.fr" });
    if (existingAdmin) {
      console.log("Admin existe déjà.");
      return;
    }

    const hashed = await bcrypt.hash("dan", 10);

    await Admin.create({
      pseudo: "dan",
      email: "dan@dan.fr",
      motDePasse: hashed,
      role: "admin"
    });

    console.log("Admin 'dan' créé avec succès.");
  } catch (err) {
    console.error("Erreur lors du seed :", err);
  } finally {
    mongoose.connection.close();
  }
}

seedAdmin();
