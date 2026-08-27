// ============================================================
// AJ SEVA - FIREBASE CONFIG
// ============================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    setDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    serverTimestamp,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {

    apiKey:
        "AIzaSyAQN4h2e7AhpY2WDRbeTw_fLfwgOSWMIMQ",

    authDomain:
        "ashish-jan-seva-kendra-web.firebaseapp.com",

    projectId:
        "ashish-jan-seva-kendra-web",

    storageBucket:
        "ashish-jan-seva-kendra-web.firebasestorage.app",

    messagingSenderId:
        "922913912976",

    appId:
        "1:922913912976:web:4b9ed0c153daf1ee18c015"

};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app =
    initializeApp(firebaseConfig);


// ============================================================
// FIRESTORE
// ============================================================

const db =
    getFirestore(app);


// ============================================================
// EXPORT
// ============================================================

export {

    app,

    db,

    collection,

    addDoc,

    getDocs,

    getDoc,

    setDoc,

    doc,

    updateDoc,

    deleteDoc,

    query,

    orderBy,

    serverTimestamp,

    onSnapshot

};