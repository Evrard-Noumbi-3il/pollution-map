import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connecté à MongoDB');
  } catch (error) {
    console.error('Erreur MongoDB :', error.message);
    process.exit(1);
  }
};

export default connectDB;