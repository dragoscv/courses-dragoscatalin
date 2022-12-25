import React from 'react'
import Router, { useRouter } from 'next/router'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc } from "firebase/firestore";
import { app } from '../../../firebase.config';
import ReactPlayer from 'react-player'
import moment from 'moment/moment';

const db = getFirestore(app)

const Lesson = () => {
    const router = useRouter()
    const { courseId, lessonId } = router.query
    const [lesson, setLesson] = React.useState(null)

    React.useEffect(() => {
        if (!courseId || !lessonId) return
        const queryLesson = doc(db, `courses/${courseId}/lessons/${lessonId}`)
        getDoc(queryLesson).then((doc) => {
            if (doc.exists()) {
                const data = doc.data()
                data.id = doc.id
                console.log('Document data:', data)
                setLesson(data)
            } else {
                console.log('No such document!')
            }
        }).catch((error) => {
            console.log('Error getting document:', error)
        })
    }, [courseId, lessonId])


    return (
        <>
            <div className='container'>
                <h1>Lesson</h1>
                {lesson && (
                    <>
                        <h2>{lesson.title}</h2>
                        <p>{lesson.description}</p>
                        <p>{moment(lesson.createdAt.toDate()).format('DD/MM/YYYY')}</p>
                        <ReactPlayer
                            width="400px"
                            playing
                            onReady={() => console.log('onReady')}
                            url={[{ src: lesson.video, type: 'video/webm' }]}
                        />
                    </>
                )}
            </div>
        </>
    )
}

export default Lesson