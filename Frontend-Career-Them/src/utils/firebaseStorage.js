import { doc, setDoc, addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";

const isFirebaseReady = Boolean(db);

export async function saveDocument(collectionName, docId, data) {
  if (!isFirebaseReady) {
    return null;
  }

  const ref = doc(db, collectionName, docId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  return ref.id;
}

export async function addDocument(collectionName, data) {
  if (!isFirebaseReady) {
    return null;
  }

  const col = collection(db, collectionName);
  const ref = await addDoc(col, { ...data, createdAt: serverTimestamp() });
  return ref.id;
}

export async function getDocuments(collectionName, maxResults = 100) {
  if (!isFirebaseReady) {
    return [];
  }

  try {
    const col = collection(db, collectionName);
    const q = query(col, orderBy("createdAt", "desc"), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch {
    return [];
  }
}

export async function getDocument(collectionName, docId) {
  if (!isFirebaseReady) {
    return null;
  }

  try {
    const snap = await getDocs(collection(db, collectionName));
    const found = snap.docs.find((d) => d.id === docId);
    return found ? { id: found.id, ...found.data() } : null;
  } catch {
    return null;
  }
}

export { isFirebaseReady };
