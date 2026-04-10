import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyANu4XjD5FL6vtAvuYQKu-flHM-wtEyxqM",
  authDomain: "habit-5d386.firebaseapp.com",
  databaseURL: "https://habit-5d386-default-rtdb.firebaseio.com",
  projectId: "habit-5d386",
  storageBucket: "habit-5d386.firebasestorage.app",
  messagingSenderId: "808547367592",
  appId: "1:808547367592:web:f3ce662547bf898099a09d"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app); 