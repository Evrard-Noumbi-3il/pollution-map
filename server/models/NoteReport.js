import mongoose from 'mongoose';

const noteReportSchema = new mongoose.Schema({
  note: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  commentaire: {
    type: String,
    required: true,
     minlength: 10 
  },
  report: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  }
},
{ timestamps: true });

// Empêche un utilisateur de noter deux fois le même report
noteReportSchema.index({ report: 1, user: 1 }, { unique: true });

export default mongoose.model('NoteReport', noteReportSchema);