import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// Connexion MongoDB
await mongoose.connect('mongodb://localhost:27017/pollution-map');

// Schéma Type
const typeSchema = new mongoose.Schema({
  nom: String,
  image: String
});
const Type = mongoose.model('Type', typeSchema, 'types');

// Schéma Avatar
const avatarSchema = new mongoose.Schema({
  nom: String,
  image: {
    contenu: Buffer,
    mimetype: String
  }
});
const Avatar = mongoose.model('Avatar', avatarSchema, 'avatars');

// Schéma User amélioré
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pseudo: { type: String, required: true },
  motDePasse: String,
  nom: String,
  prenom: String,
  telephone: String,
  dateNaissance: Date,
  sexe: String,
  statut:  String,
  localisation: {
    lat: Number,
    lng: Number
  },
  adresse: {
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
  },
  avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Avatar' },
  points: [{
    valeur: Number,
    raison: String,
    date: { type: Date, default: Date.now }
  }],
  favoris: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  isBlocked: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema, 'users');

// Schéma Admin
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
}, { collection: 'admins' });
const Admin = mongoose.model('Admin', adminSchema);

// Schéma Report
const reportSchema = new mongoose.Schema({
  description: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  date: Date,
  status: { type: String, default: 'en attente' },
  gravite: { type: Number, default: 3 },
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'Type' }
});
const Report = mongoose.model('Report', reportSchema, 'reports');

// Seed
async function seedData() {
  try {
    // Nettoyage
    await Promise.all([
      Report.deleteMany(),
      User.deleteMany(),
      Admin.deleteMany(),
      Type.deleteMany(),
      Avatar.deleteMany()
    ]);

    // Types
    const types = await Type.insertMany([
  // Pollutions
  { nom: "Pollution", image: "/img/icons/pollut.png" },
  { nom: "Pollution de l'air", image: "/img/icons/air.png" },
  { nom: "Pollution de l'eau", image: "/img/icons/water.png" },
  { nom: "Pollution déchets", image: "/img/icons/trash.png" },
  { nom: "Pollution sonore", image: "/img/icons/noise.png" },
  { nom: "Pollution lumineuse", image: "/img/icons/light.png" },
  { nom: "Pollution du sol", image: "/img/icons/soil.png" },
   { nom: "Pollution industrielle", image: "/img/icons/industry.png" },
  { nom: "Pollution marine", image: "/img/icons/marine.png" },
  { nom: "Déversement chimique", image: "/img/icons/chemical.png" },
  { nom: "Déforestation", image: "/img/icons/deforestation.png" },
  { nom: "Incendie de forêt", image: "/img/icons/fire.png" },
  { nom: "Dépôt sauvage", image: "/img/icons/dump.png" },
  { nom: "Érosion des sols", image: "/img/icons/erosion.png" },
  { nom: "Déchets électroniques", image: "/img/icons/e-waste.png" },

  // Dégradations urbaines
  { nom: "Dégradation urbaine", image: "/img/icons/urban-degradation.png" },
  { nom: "Graffiti", image: "/img/icons/graffiti.png" },
  { nom: "Éclairage public défectueux", image: "/img/icons/lamp.png" },
  { nom: "Trottoir endommagé", image: "/img/icons/sidewalk.png" },
  { nom: "Signalisation manquante ou cassée", image: "/img/icons/sign.png" },
  { nom: "Nid-de-poule", image: "/img/icons/pothole.png" },

  // Environnement & Nature
  { nom: "Environnement & Nature", image: "/img/icons/nature.png" },
  { nom: "Espèces menacées", image: "/img/icons/endangered.png" },
  { nom: "Habitat naturel dégradé", image: "/img/icons/habitat.png" },
  { nom: "Espèce invasive", image: "/img/icons/invasive.png" },

  // Risques naturels
  { nom: "Risques naturels", image: "/img/icons/natural-disaster.png" }, 
  { nom: "Glissement de terrain", image: "/img/icons/landslide.png" },
  { nom: "Inondation", image: "/img/icons/flood.png" },
  { nom: "Arbre dangereux", image: "/img/icons/tree.png" },

  // Infrastructures et sécurité
  { nom: "Infrastructures et sécurité", image: "/img/icons/infrastructure.png" },
  { nom: "Panneau de signalisation manquant", image: "/img/icons/sign-missing.png" },
  { nom: "Route endommagée", image: "/img/icons/road-damaged.png" },
  { nom: "Éclairage public défectueux", image: "/img/icons/lamp-faulty.png" },
  { nom: "Passage piéton manquant", image: "/img/icons/crosswalk-missing.png" },
  { nom: "Borne incendie obstruée", image: "/img/icons/fire-hydrant.png" },
  { nom: "Borne incendie manquante", image: "/img/icons/fire-hydrant.png" },
  { nom: "Route inondée", image: "/img/icons/road-flooded.png" },
  { nom: "Pont endommagé", image: "/img/icons/bridge.png" },
  { nom: "Pont manquant", image: "/img/icons/bridge.png" },
  { nom: "Barrière de sécurité manquante", image: "/img/icons/guardrail.png" },
  { nom: "Barrière de sécurité cassée", image: "/img/icons/guardrail.png" },
  { nom: "Borne de recharge électrique manquante", image: "/img/icons/ev-charger-missing.png" },
  { nom: "Borne de recharge électrique défectueuse", image: "/img/icons/ev-charger-faulty.png" },
  { nom: "Fuite d'eau", image: "/img/icons/waterleak.png" },
  { nom: "Câble électrique à découvert", image: "/img/icons/electric.png" },
  { nom: "Obstacle dangereux", image: "/img/icons/obstacle.png" },

  // Comportements nuisibles
  { nom: "Comportements nuisibles", image: "/img/icons/nuisance.png" },
  { nom: "Déchets abandonnés", image: "/img/icons/littering.png" },
  { nom: "Feu sauvage", image: "/img/icons/wildfire.png" },
  { nom: "Abus de voies publiques", image: "/img/icons/public-space-abuse.png" },
  { nom: "Vandalisme", image: "/img/icons/vandalism.png" },
  { nom: "Nuisances sonores", image: "/img/icons/noise.png" },
  { nom: "Stationnement gênant", image: "/img/icons/parking-issue.png" },
  { nom: "Chasse illégale", image: "/img/icons/illegal-hunting.png" },
  { nom: "Pêche illégale", image: "/img/icons/illegal-fishing.png" },
  { nom: "Trafic d'animaux sauvages", image: "/img/icons/wildlife-trafficking.png" },
  { nom: "Brûlage à l'air libre", image: "/img/icons/open-burning.png" },
  { nom: "Utilisation de pesticides interdits", image: "/img/icons/illegal-pesticides.png" },
  { nom: "Déchets toxiques", image: "/img/icons/toxic-waste.png" },
  { nom: "Abandon d’animaux", image: "/img/icons/pets.png" },
  { nom: "Tapage nocturne", image: "/img/icons/noise.png" },
  { nom: "Brûlage de déchets", image: "/img/icons/burn.png" }
]);


    // Avatars
    const avatarAdmin = await Avatar.create({
      nom: 'Admin.png',
      image: {
        contenu: Buffer.from('../img/avatars/Admin.png'),
        mimetype: 'Admin/png'
      }
    });

    const avatar1 = await Avatar.create({
      nom: 'avatar1.png',
      image: {
        contenu: Buffer.from('données_fake_avatar_1'),
        mimetype: 'image/png'
      }
    });

    const avatar2 = await Avatar.create({
      nom: 'avatar2.png',
      image: {
        contenu: Buffer.from('données_fake_avatar_2'),
        mimetype: 'image/png'
      }
    });

    // Utilisateurs
    const userHash = await bcrypt.hash('motdepasse123', 10);
    const user = await User.create({
      email: 'user@pollution-map.org',
      pseudo: 'yaounde_user',
      motDePasse: userHash,
      nom: 'Tchoua',
      prenom: 'Kevin',
      telephone: '690000001',
      dateNaissance: new Date('1995-04-12'),
      sexe: 'M',
      statut: 'Fiable',
      localisation: { lat: 3.87, lng: 11.52 },
      adresse: {
        rue: 'Rue des écoliers',
        ville: 'Yaoundé',
        codePostal: '0001',
        pays: 'Cameroun'
      },
      avatar: avatar1._id,
      points: [
        { valeur: 10, raison: 'Premier rapport validé' },
        { valeur: 20, raison: 'Bonne note par 3 utilisateurs' }
      ]
    });

    const user2 = await User.create({
      email: 'marie@pollution-map.org',
      pseudo: 'marie_user',
      motDePasse: await bcrypt.hash('marie123', 10),
      nom: 'Mbappe',
      prenom: 'Marie',
      telephone: '690000002',
      dateNaissance: new Date('1998-07-01'),
      sexe: 'F',
      statut: 'Actif',
      localisation: { lat: 3.85, lng: 11.50 },
      adresse: {
        rue: 'Avenue des sciences',
        ville: 'Yaoundé',
        codePostal: '0002',
        pays: 'Cameroun'
      },
      avatar: avatar2._id,
      points: [
        { valeur: 15, raison: 'Rapport pertinent' },
        { valeur: 10, raison: 'Partage sur les réseaux' }
      ]
    });

    // Création des mots de passe hachés
const [adminHash, danHash, maxHash] = await Promise.all([
  bcrypt.hash('admin', 10),
  bcrypt.hash('dan', 10),
  bcrypt.hash('max', 10)
]);

// Insertion des administrateurs

const defaultAvatar = await Avatar.findOne({ nom: 'Admin.png' });
if (!defaultAvatar) {
  throw new Error("Avatar 'Admin' introuvable. Veuillez l'ajouter dans la collection Avatars.");
}


await Admin.insertMany([
  {
    email: 'admin@pollution-map.org',
    pseudo: 'Admin',
    motDePasse: adminHash,
    nom: 'Super',
    prenom: 'Admin',
    telephone: '0600000000',
    dateNaissance: new Date('1980-01-01'),
    sexe: 'Homme',
    role: 'admin',
    adresse: {
      rue: '1 rue de l’administration',
      ville: 'Paris',
      codePostal: '75000',
      pays: 'France'
    },
    avatar: defaultAvatar._id,
    isBlocked: false
  },
  {
    email: 'dan@dan.fr',
    pseudo: 'dan',
    motDePasse: danHash,
    nom: 'Dupont',
    prenom: 'Dan',
    telephone: '0611111111',
    dateNaissance: new Date('1990-05-15'),
    sexe: 'Homme',
    role: 'moderateur',
    adresse: {
      rue: '2 rue des modérateurs',
      ville: 'Lyon',
      codePostal: '69000',
      pays: 'France'
    },
    avatar: defaultAvatar._id,
    isBlocked: false
  },
  {
    email: 'max@max.fr',
    pseudo: 'max',
    motDePasse: maxHash,
    nom: 'Martin',
    prenom: 'Max',
    telephone: '0622222222',
    dateNaissance: new Date('1985-07-20'),
    sexe: 'Homme',
    role: 'moderateur',
    adresse: {
      rue: '3 rue des modérateurs',
      ville: 'Marseille',
      codePostal: '13000',
      pays: 'France'
    },
    avatar: defaultAvatar._id,
    isBlocked: false
  }
]);

    // Rapports
    await Report.insertMany([
      {
        description: 'Pollution de l’air près du rond-point Nlongkak',
        coordinates: { lat: 3.873, lng: 11.512 },
        date: new Date(),
        status: 'en attente',
        gravite: 4,
        utilisateur: user._id,
        type: types[1]._id,
        evaluation: {
          note: 75,
          nombre: 3
        }
      },
      {
        description: 'Décharge sauvage près de l’avenue Kennedy',
        coordinates: { lat: 3.866, lng: 11.514 },
        date: new Date(),
        status: 'validé',
        gravite: 3,
        utilisateur: user2._id,
        type: types[2]._id,
        evaluation: {
          note: 80,
          nombre: 5
        },
      }
    ]);

    console.log('✅ Données insérées avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors du seed :', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seedData();
