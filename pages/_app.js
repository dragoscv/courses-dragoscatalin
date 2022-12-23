import React from 'react';
import Layout from '../components/Layout';
import { getAnalytics, logEvent } from "firebase/analytics";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, setDoc, doc } from "firebase/firestore";
import { app } from '../firebase.config';
import '../styles/globals.css'

const db = getFirestore(app);

function MyApp({ Component, pageProps }) {

  //sign in anonymously if no user is signed in
  React.useEffect(() => {
    const analytics = getAnalytics(app);
    const auth = getAuth(app);
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        console.log('No user signed in.');
        signInAnonymously(auth)
          .then(() => {
            logEvent(analytics, 'sign_in', {
              anonymous: true
            });
            console.log('Anonymous user signed in.')
            setDoc(doc(db, 'users', user.uid), {
              lastAction: new Date(),
              isAnonymous: true,
              uid: user.uid
            }, { merge: true });
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode + errorMessage);
          });
      }

      if (user && user.isAnonymous) {
        logEvent(analytics, 'sign_in', {
          anonymous: true
        });
        console.log('Anonymous user signed in.')
        setDoc(doc(db, 'users', user.uid), {
          lastAction: new Date(),
          isAnonymous: true,
          uid: user.uid
        }, { merge: true });
      }

      if (user && !user.isAnonymous) {
        logEvent(analytics, 'sign_in', {
          anonymous: false
        });
        setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
          isAnonymous: false,
          lastAction: new Date(),
        }, { merge: true });
      }
    });
  }, [])

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
