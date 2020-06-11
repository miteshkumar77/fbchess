import { auth } from "../services/firebase";

export function signup(email, password) {
  return auth().createUserWithEmailAndPassword(email, pasword);
}

export function signin(email, password) {
  return auth().signInWithEmailAndPassword(email, password);
}
