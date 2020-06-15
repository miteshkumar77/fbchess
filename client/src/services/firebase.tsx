import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";

const config = {
  apiKey: "AIzaSyD-ICtN8MYx5BnwjcspwoShj0CjNfASy2E",
  authDomain: "fbchess-6d48c.firebaseapp.com",
  databaseURL: "https://fbchess-6d48c.firebaseio.com",
};
firebase.initializeApp(config);
export const auth: typeof firebase.auth = firebase.auth;
export const db: typeof firebase.database = firebase.database;
