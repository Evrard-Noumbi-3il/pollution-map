// controllers/avatarController.js
import Avatar from '../models/avatar.js'

export const getAvatars =  async (req, res) => {
  try {
    const avatars = await Avatar.find()

    const avatarsBase64 = avatars.map(a => ({
      _id: a._id,
      nom: a.nom,
      image: {
        mimetype: a.image.mimetype,
        contenu: a.image.contenu.toString('base64')
      }
    }))

    res.json(avatarsBase64)
  } catch (err) {
    console.error('Erreur lors de la récupération des avatars :', err)
    res.status(500).json({ message: 'Erreur serveur' })
  }
}
