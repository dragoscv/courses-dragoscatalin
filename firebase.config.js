// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { firebaseApiKey, firebaseAuthDomain, firebaseProjectId, firebaseStorageBucket, firebaseMessagingSenderId, firebaseAppId, firebaseMeasurementId } from './config'
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
  measurementId: firebaseMeasurementId
};
// console.log(firebaseConfig);
// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// export const analytics = getAnalytics(app);