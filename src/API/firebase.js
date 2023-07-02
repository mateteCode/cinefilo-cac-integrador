import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  addDoc,
} from "firebase/firestore";
import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAxFzrCtrPqYAjIW8xzaaNDq9Cum5IPlr0",
  authDomain: "fir-auth-article-5a22c.firebaseapp.com",
  projectId: "fir-auth-article-5a22c",
  storageBucket: "fir-auth-article-5a22c.appspot.com",
  messagingSenderId: "497685829031",
  appId: "1:497685829031:web:4171ccc2354c4fcb3a9282",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/* Funciones privadas */
const getField = async (col, field, fieldId, id) => {
  try {
    const q = query(collection(db, col), where(fieldId, "==", id));
    const docs = await getDocs(q);
    const documentRef = doc(db, col, docs.docs[0].id);
    const documentSnapshot = await getDoc(documentRef);
    if (documentSnapshot.exists()) {
      const result = documentSnapshot.data()[field];
      return result;
    } else {
      console.log("No existe el documento");
    }
  } catch (err) {
    console.log("No se puede acceder al campo");
  }
  return null;
};

/* Funciones públicas */
const signInWithGoogle = async () => {
  try {
    const res = await signInWithPopup(auth, new GoogleAuthProvider());
    const user = res.user;
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      await addDoc(collection(db, "users"), {
        uid: user.uid,
        name: user.displayName,
        authProvider: "google",
        email: user.email,
        photo: user.photoURL,
        favorites: [],
        blocked: [],
      });
    }
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logInWithEmailAndPassword = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    console.log(res);
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const registerWithEmailAndPassword = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    console.log(res);
    const user = res.user;
    await addDoc(collection(db, "users"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
      photo: null,
      favorites: [],
      blocked: [],
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const sendPasswordReset = async (email) => {
  try {
    const res = await sendPasswordResetEmail(auth, email);
    console.log(res);
    alert("Password reset link sent!");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

const logout = () => {
  signOut(auth);
};

const addFavorites = async (user, movie) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    const documentRef = doc(db, "users", docs.docs[0].id);
    await updateDoc(documentRef, {
      favorites: arrayUnion(movie),
    });
    console.log("pelicula agregada");
  } catch (err) {
    console.log(err);
  }
};

const addBlocked = async (user, movie) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    const documentRef = doc(db, "users", docs.docs[0].id);
    await updateDoc(documentRef, {
      blocked: arrayUnion(movie),
    });
    console.log("pelicula bloqueada");
  } catch (err) {
    console.log(err);
  }
};

const getFavorites = async (user, setFavorites) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    const documentRef = doc(db, "users", docs.docs[0].id);
    const documentSnapshot = await getDoc(documentRef);
    if (documentSnapshot.exists()) {
      const result = documentSnapshot.data().favorites;
      setFavorites([...result]);
    } else {
      // The document doesn't exist
      console.log("No such document!");
    }
  } catch (error) {
    console.log(error);
  }
};

const getBlocked = async (user, setBlocked) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    const documentRef = doc(db, "users", docs.docs[0].id);
    const documentSnapshot = await getDoc(documentRef);
    if (documentSnapshot.exists()) {
      const result = documentSnapshot.data().blocked;
      setBlocked([...result]);
    } else {
      // The document doesn't exist
      console.log("No such document!");
    }
  } catch (error) {
    console.log(error);
  }
};

const removeFavorites = async (user, movie) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    const documentRef = doc(db, "users", docs.docs[0].id);
    await updateDoc(documentRef, {
      favorites: arrayRemove(movie),
    });
    console.log("pelicula eliminada de favoritas");
  } catch (err) {
    console.log(err);
  }
};

const removeBlocked = async (user, movie) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const docs = await getDocs(q);
    const documentRef = doc(db, "users", docs.docs[0].id);
    await updateDoc(documentRef, {
      blocked: arrayRemove(movie),
    });
    console.log("pelicula eliminada de bloqueadas");
  } catch (err) {
    console.log(err);
  }
};

const addComment = async (movieId, comment) => {
  try {
    const q = query(collection(db, "comments"), where("id", "==", movieId));
    const docs = await getDocs(q);
    if (docs.docs.length === 0) {
      console.log("No existe comentario de esa peli");
      await addDoc(collection(db, "comments"), {
        id: movieId,
        comments: [comment],
      });
    } else {
      const documentRef = doc(db, "comments", docs.docs[0].id);
      await updateDoc(documentRef, {
        comments: arrayUnion(comment),
      });
    }
    console.log("Comentario agregado");
  } catch (err) {
    console.error(err);
  }
};

const getComments = async (movieId) => {
  try {
    const q = query(collection(db, "comments"), where("id", "==", movieId));
    const docs = await getDocs(q);
    const documentRef = doc(db, "comments", docs.docs[0].id);
    const documentSnapshot = await getDoc(documentRef);
    if (documentSnapshot.exists()) {
      const result = documentSnapshot.data().comments;
      console.log(result);
      return result;
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.log(error);
  }
  return [];
};

/* const getComments = async (movieId) => {
  let result = getField("comments", "comments", "id", movieId);
  result = result ? result : [];
  console.log(result);
  return result;
}; */

const setUserPhoto = async (userId, urlFile) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", userId));
    const docs = await getDocs(q);
    const docRef = doc(db, "users", docs.docs[0].id);
    await updateDoc(docRef, {
      photo: urlFile,
    });
  } catch (err) {
    console.log(err);
  }
};

const uploadFile = async (file, userId) => {
  const storageRef = ref(storage, `photo-user${userId}`);
  await uploadBytes(storageRef, file);
  const urlFile = await getDownloadURL(storageRef);
  await setUserPhoto(userId, urlFile);
  return urlFile;
};

const getUserPhoto = async (userId) => {
  return await getField("users", "photo", "uid", userId);
};

const getUserName = async (userId) => {
  return await getField("users", "name", "uid", userId);
};

const getBlocked2 = async (userId) => {
  return await getField("users", "blocked", "uid", userId);
};

const getFavorites2 = async (userId) => {
  return await getField("users", "favorites", "uid", userId);
};

export {
  db,
  auth,
  signInWithGoogle,
  logInWithEmailAndPassword,
  registerWithEmailAndPassword,
  sendPasswordReset,
  logout,
  addFavorites,
  getFavorites,
  removeFavorites,
  addBlocked,
  getBlocked,
  removeBlocked,
  addComment,
  getComments,
  uploadFile,
  getUserPhoto,
  getUserName,
  getBlocked2,
  getFavorites2
};
