// ============================================================
// AJ SEVA FIREBASE CONFIG
// ============================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    doc,
    serverTimestamp
} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from
    "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";


// ============================================================
// FIREBASE CONFIG
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyAQN4h2e7AhpY2WDRbeTw_fLfwgOSWMIMQ",
    authDomain: "ashish-jan-seva-kendra-web.firebaseapp.com",
    projectId: "ashish-jan-seva-kendra-web",
    storageBucket: "ashish-jan-seva-kendra-web.firebasestorage.app",
    messagingSenderId: "922913912976",
    appId: "1:922913912976:web:4b9ed0c153daf1ee18c015"
};


// ============================================================
// INITIALIZE FIREBASE
// ============================================================

const app = initializeApp(firebaseConfig);


// ============================================================
// FIRESTORE
// ============================================================

const db = getFirestore(app);


// ============================================================
// AUTH
// ============================================================

const auth = getAuth(app);


// ============================================================
// EXPORT
// ============================================================

export {
    app,
    db,
    auth,

    // Firestore
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    doc,
    serverTimestamp,

    // Authentication
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
};