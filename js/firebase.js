import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

//firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyDOOqaKrBvNJJO7thvz5VEdPCOPuJGUqSk",
  authDomain: "countrypedia-58d74.firebaseapp.com",
  projectId: "countrypedia-58d74",
  storageBucket: "countrypedia-58d74.firebasestorage.app",
  messagingSenderId: "1050730735011",
  appId: "1:1050730735011:web:f9530bb7e577f1eff02616"
};
const app = initializeApp(firebaseConfig); //start the firebase app
export const auth = getAuth(app); //export auth for login/register/logout
export const db = getFirestore(app); //export firestore for saving chat logs