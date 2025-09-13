import multer from 'multer';

const storage = multer.memoryStorage(); // Stocke l'image directement en mémoire

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite à 5 Mo
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers images sont autorisés.'));
    }
  }
});

export default upload;
