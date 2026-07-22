import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const readEnv = (key) => String(process.env[key] || "").trim();

const firebaseConfig = {
  apiKey: readEnv("REACT_APP_FIREBASE_API_KEY"),
  authDomain: readEnv("REACT_APP_FIREBASE_AUTH_DOMAIN"),
  projectId: readEnv("REACT_APP_FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("REACT_APP_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("REACT_APP_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("REACT_APP_FIREBASE_APP_ID"),
  measurementId: readEnv("REACT_APP_FIREBASE_MEASUREMENT_ID"),
};

const requiredKeys = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

export const isFirebaseConfigured = Boolean(
  requiredKeys.every(Boolean) &&
    !String(firebaseConfig.apiKey).includes("YOUR_") &&
    !String(firebaseConfig.authDomain).includes("YOUR_") &&
    !String(firebaseConfig.projectId).includes("YOUR_") &&
    !String(firebaseConfig.appId).includes("YOUR_")
);
console.log("Firebase configured:", isFirebaseConfigured);

if (!isFirebaseConfigured) {
  // eslint-disable-next-line no-console
  console.warn(
    "Firebase is not configured. Add REACT_APP_FIREBASE_* values in .env."
  );
}

let app;
let auth = null;
let db = null;

if (isFirebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
