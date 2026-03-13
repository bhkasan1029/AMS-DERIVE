import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirestore(collectionName) {
  const colRef = collection(db, collectionName);

  const getAll = () => getDocs(colRef);

  const getById = (id) => getDoc(doc(db, collectionName, id));

  const add = (data) => addDoc(colRef, data);

  const update = (id, data) => updateDoc(doc(db, collectionName, id), data);

  const remove = (id) => deleteDoc(doc(db, collectionName, id));

  return { getAll, getById, add, update, remove };
}
