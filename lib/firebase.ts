// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "@firebase/firestore"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCgMPkigrfoYghGD9UcT2pEvOk9eU2Auag",
  authDomain: "data-9e315.firebaseapp.com",
  projectId: "data-9e315",
  storageBucket: "data-9e315.appspot.com",
  messagingSenderId: "684180005617",
  appId: "1:684180005617:web:a4a88db1a2ed75740eff50",
  measurementId: "G-DVGE8XLMP3"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }
