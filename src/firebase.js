// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// ✅ 下のオブジェクトは、Firebaseコンソールで表示された設定値に置き換えてください
const firebaseConfig = {
  apiKey: "AIzaSyDTpULY9e3v4jooYuMNVT3yBeoxHX1Vnig",
  authDomain: "toiletpapermap.firebaseapp.com",
  projectId: "toiletpapermap",
  storageBucket: "toiletpapermap.appspot.com",
  messagingSenderId: "815418952735",
  appId: "1:815418952735:web:95d3406530c7dfd4e0192a"
};

// 初期化と Firestore のエクスポート
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
