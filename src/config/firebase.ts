import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// REEMPLAZA ESTOS VALORES CON TUS CREDENCIALES DE FIREBASE
const firebaseConfig = {
  apiKey: ,
  authDomain: ,
  projectId: ,
  storageBucket: ,
  messagingSenderId: ,
  appId: 
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Servicios de Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
