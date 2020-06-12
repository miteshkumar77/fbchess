import { auth } from "../services/firebase";

export function signup(
  email: string,
  password: string
): Promise<firebase.auth.UserCredential> {
  return auth().createUserWithEmailAndPassword(email, password);
}

export function signin(
  email: string,
  password: string
): Promise<firebase.auth.UserCredential> {
  return auth().signInWithEmailAndPassword(email, password);
}
