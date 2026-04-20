// firebase.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
    getAuth, 
    GithubAuthProvider,
    signInWithPopup,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    updateDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Your exact Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCGd7y12N9iaDmR912XefuUZQtIAPnmQZ8",
    authDomain: "kodo-559e9.firebaseapp.com",
    projectId: "kodo-559e9",
    storageBucket: "kodo-559e9.firebasestorage.app",
    messagingSenderId: "931573681729",
    appId: "1:931573681729:web:064234b9b2b626493e00c0",
    measurementId: "G-QDTLVDK5K1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// GitHub Auth Provider
const githubProvider = new GithubAuthProvider();
githubProvider.addScope('repo'); // Request repo access for KoDo Vault commits

// Export instances and utilities
export { auth, db, githubProvider, signInWithPopup, signOut };
export { collection, doc, setDoc, getDoc, updateDoc };

// Optional: Analytics (only in production)
let analytics = null;
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    import('https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js')
        .then(({ getAnalytics }) => {
            analytics = getAnalytics(app);
        });
}
export { analytics };