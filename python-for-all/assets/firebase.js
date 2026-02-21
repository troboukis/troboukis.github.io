import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2uw6XS2-wxHipJp7cbKOfdKD_UP9AqgE",
  authDomain: "python-for-all-4e37a.firebaseapp.com",
  projectId: "python-for-all-4e37a",
  storageBucket: "python-for-all-4e37a.firebasestorage.app",
  messagingSenderId: "461350010736",
  appId: "1:461350010736:web:a599954b4d018425d0d9b5",
  measurementId: "G-JTV4FVXK99",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
getAnalytics(app);
