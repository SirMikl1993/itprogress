import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Импорт getStorage

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
// Инициализация Storage (добавляем это)
const storage = getStorage(app);

export { app, db, auth, storage };