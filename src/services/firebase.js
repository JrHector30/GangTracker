import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gang-tracker-rp",
  appId: "1:445062984600:web:c2bbbf6a03244aad96f1ed",
  storageBucket: "gang-tracker-rp.firebasestorage.app",
  apiKey: "AIzaSyA5OWEHgnXvVZi3i3DQHHgV3XIXTL3-6HM",
  authDomain: "gang-tracker-rp.firebaseapp.com",
  messagingSenderId: "445062984600"
};

let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn('Firebase init error:', e);
}

export { app, db };
