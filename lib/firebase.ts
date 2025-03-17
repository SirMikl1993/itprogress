import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAsw6_QT2wF56ICkj49RiTablr9O8gBhUA",
    authDomain: "blog-65967.firebaseapp.com",
    databaseURL: "https://blog-65967-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "blog-65967",
    storageBucket: "blog-65967.appspot.com",
    messagingSenderId: "440713244328",
    appId: "1:440713244328:web:2b121009f22818bfb89c9d"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };