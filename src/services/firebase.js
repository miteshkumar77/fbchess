import firebase from "firebase";

const config = {
  apiKey: "AIzaSyD-ICtN8MYx5BnwjcspwoShj0CjNfASy2E",
  authDomain: "fbchess-6d48c.firebaseapp.com",
  databaseURL: "https://fbchess-6d48c.firebaseio.com",
};
firebase.initializeApp(config);
export const auth = firebase.auth;
export const db = firebase.db;
