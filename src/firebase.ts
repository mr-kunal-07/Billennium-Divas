import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6iyPkmaX8L_uIb3A9FcAa6F0aAnw-EDQ",
  authDomain: "billennium-divas.firebaseapp.com",
  projectId: "billennium-divas",
  storageBucket: "billennium-divas.firebasestorage.app",
  messagingSenderId: "856073676226",
  appId: "1:856073676226:web:04164f3aa3f152e81b625b",
  measurementId: "G-7KQ3NTENMB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };