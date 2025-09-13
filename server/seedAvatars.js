import mongoose from 'mongoose'
import fs from 'fs'
import path from 'path'
import mime from 'mime'
import Avatar from './models/avatar.js'

// Connexion à MongoDB
await mongoose.connect('mongodb://localhost:27017/pollution-map')

// Dossier des avatars
const avatarDir = path.join('../','client','public', 'img', 'avatars')

try {
  // Lire les fichiers
  const fichiers = fs.readdirSync(avatarDir)

  // Filtrer uniquement les images
  const images = fichiers.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f))

  // Vider la collection
  await Avatar.deleteMany()

  // Charger les images en base
  const avatarDocs = images.map(nom => {
    const filePath = path.join(avatarDir, nom)
    const contenu = fs.readFileSync(filePath)
    const mimetype = mime.getType(filePath)

    return {
      nom,
      image: {
        contenu,
        mimetype
      }
    }
  })

  await Avatar.insertMany(avatarDocs)
  console.log(`✅ ${avatarDocs.length} avatars insérés avec succès.`)
} catch (err) {
  console.error('❌ Erreur lors de l’insertion des avatars :', err.message)
} finally {
  await mongoose.disconnect()
}
