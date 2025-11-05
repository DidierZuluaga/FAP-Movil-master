import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// REEMPLAZA ESTOS VALORES CON TUS CREDENCIALES DE FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDdIVKBORjxavuVzCCkbe0oQJCoEj1b0DM",
  authDomain: "fap-movil.firebaseapp.com",
  projectId: "fap-movil",
  storageBucket: "fap-movil.firebasestorage.app",
  messagingSenderId: "336287696603",
  appId: "1:336287696603:web:7aa678df0388861625eefe"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;