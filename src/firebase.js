// src/firebase.js
// import { initializeApp } from "firebase/app";
// import { getDatabase, ref, push, onChildAdded } from "firebase/database";
// import firebase from "firebase/app";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCh2Y7e3ladOtMabuerpgP1HHZiOuP96fU",
  authDomain: "chat-demo-9adce.firebaseapp.com",
  projectId: "chat-demo-9adce",
  storageBucket: "chat-demo-9adce.firebasestorage.app",
  messagingSenderId: "236612208714",
  appId: "1:236612208714:web:ae7930ebbb046c33edbeb3",
  measurementId: "G-0Y9D1HS51J"
};
// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

// export default db;
// Initialize
const app = initializeApp(firebaseConfig);

// Get Firestore instance
const db = getFirestore(app);

export default db;
// const app = initializeApp(firebaseConfig);
// const db = getDatabase(app);

// export { db, ref, push, onChildAdded };



// import "firebase/firestore";

// const firebaseConfig = {
//   // your config here
// };

// firebase.initializeApp(firebaseConfig);
// const db = firebase.firestore();

// export default db;
