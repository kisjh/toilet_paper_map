// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWXrnsHbHoFOFKiQymBc3kcONbCktcSyY",
  authDomain: "toilet-paper-map.firebaseapp.com",
  projectId: "toilet-paper-map",
  storageBucket: "toilet-paper-map.firebasestorage.app",
  messagingSenderId: "814021767918",
  appId: "1:814021767918:web:5c0e1e2c0fa971ce0eb9ff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
