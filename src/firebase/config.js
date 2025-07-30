import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAxFCRKom6rdvqhtYnh945ptP6F5ojtPx4",
  authDomain: "disparador-f7f2a.firebaseapp.com",
  projectId: "disparador-f7f2a",
  storageBucket: "disparador-f7f2a.firebasestorage.app",
  messagingSenderId: "327920817043",
  appId: "1:327920817043:web:c3e63e94377aa26c89ce66",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
