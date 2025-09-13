import Type from '../models/Type.js'; // modélisation Mongoose des types

// GET /api/types — retourne tous les types
export const getTypes = async (req, res) => {
  try {
    const types = await Type.find(); // récupérer uniquement _id et nom
    res.json(types);
  } catch (error) {
    console.error('Erreur getTypes:', error);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des types.' });
  }
};

export const updateType = async (req, res) => {
  try {
    const { nom, image } = req.body;
    const type = await Type.findByIdAndUpdate(
      req.params.id,
      { nom, image },
      { new: true }
    );
    if (!type) return res.status(404).json({ message: "Type non trouvé" });
    res.json({ message: "Type modifié", type });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la modification" });
  }
};

export const deleteType = async (req, res) => {
  try {
    const type = await Type.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ message: "Type non trouvé" });
    res.json({ message: "Type supprimé" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

export const createType = async (req, res) => {
  try {
    const { nom, image } = req.body;
    if (!nom || !image) {
      return res.status(400).json({ message: "Nom et image requis." });
    }
    const nouveau = new Type({ nom, image });
    await nouveau.save();
    res.status(201).json({ message: "Type ajouté avec succès", type: nouveau });
  } catch (err) {
    console.error("Erreur ajout type :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
