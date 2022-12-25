import React from 'react'
import Router, { useRouter } from 'next/router'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc } from "firebase/firestore";
import { app } from '../../../../firebase.config';
import moment from 'moment/moment';

const db = getFirestore(app)

const Lesson = () => {
    const router = useRouter()
    const { lessonId } = router.query





    return (
        <>
            {lessonId}
        </>
    )
}

export default Lesson