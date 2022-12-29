import React from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Router from 'next/router';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs } from "firebase/firestore";
import { app } from '../firebase.config';
import Courses from '../components/Courses';

const auth = getAuth(app);
const db = getFirestore(app);

export default function Home() {
  const [courses, setCourses] = React.useState([]);

  React.useEffect(() => {
    const getCourses = async () => {
      const courses = [];
      const querySnapshot = await getDocs(collection(db, "courses"));
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        data.id = doc.id;
        courses.push(data);
      });
      setCourses(courses);
    };
    getCourses();
  }, []);

  return (
    <Courses />
  )
}
