import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Remplacez l'objet suivant par la configuration de votre propre projet Firebase
// que vous pouvez trouver dans la console Firebase > Paramètres du projet.
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY_ICI",
  authDomain: "VOTRE_AUTH_DOMAIN_ICI",
  projectId: "VOTRE_PROJECT_ID_ICI",
  storageBucket: "VOTRE_STORAGE_BUCKET_ICI",
  messagingSenderId: "VOTRE_SENDER_ID_ICI",
  appId: "VOTRE_APP_ID_ICI"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Exporte l'instance d'authentification pour l'utiliser dans d'autres parties de l'application
export const auth = getAuth(app);
