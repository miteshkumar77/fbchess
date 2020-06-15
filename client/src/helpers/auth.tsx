import { auth } from "../services/firebase";

export function signup(email: string, password: string) {
  return auth().createUserWithEmailAndPassword(email, password);
}

export function signin(email: string, password: string) {
  return auth().signInWithEmailAndPassword(email, password);
}

export function signInWithGoogle() {
  const provider = new auth.GoogleAuthProvider();
  return auth().signInWithPopup(provider);
}

export function signInWithGitHub() {
  const provider = new auth.GithubAuthProvider();
  return auth().signInWithPopup(provider);
}

export function logout() {
  return auth().signOut();
}

export function getCurrentUser() {
  return auth().currentUser;
}
