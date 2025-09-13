import mongoose from 'mongoose'

const typeSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  image: { type: String, required: true } // ex: "/img/icons/air.png"
})

export default mongoose.model('Type', typeSchema)
