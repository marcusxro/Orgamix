// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCCRU6n6pjpe846dHzlq-m_hg1DFCqJcCU",
  authDomain: "ewan-91c37.firebaseapp.com",
  projectId: "ewan-91c37",
  storageBucket: "ewan-91c37.appspot.com",
  messagingSenderId: "836380366380",
  appId: "1:836380366380:web:c9731d6cfd33c98a96e389"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firebaseAuthKey = getAuth(app)