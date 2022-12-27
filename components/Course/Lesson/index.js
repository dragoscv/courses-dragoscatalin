import React from 'react'
import Router, { useRouter } from 'next/router'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc } from "firebase/firestore";
import { app } from '../../../firebase.config';
import moment from 'moment/moment';

const db = getFirestore(app)

const Lesson = () => {
    const router = useRouter()
    const { courseId, lessonId } = router.query
    const [lesson, setLesson] = React.useState(null)
    const [videoWidth, setVideoWidth] = React.useState('300px')
    const [videoHeight, setVideoHeight] = React.useState('200px')

    const player = React.useRef(null)



    React.useEffect(() => {
        // video width and height depending on screen size
        const handleResize = () => {
            //if window width is less than 768px, set video width to '300px' and height to '200px' else set video width to '100%' and height to '100%'
            if (window.innerWidth < 768) {
                setVideoWidth('300px')
                setVideoHeight('200px')
            } else {
                setVideoWidth('600px')
                setVideoHeight('400px')
            }
        }
        window.addEventListener('resize', handleResize)
        handleResize()
        return () => {
            window.removeEventListener('resize', handleResize)
        }

    }, [])



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
                        <div className='player-wrapper py-4'>
                            <video
                                ref={player}
                                src={lesson.video}
                                width={videoWidth}
                                height={videoHeight}
                                controls                                
                            />

                        </div>


                    </>
                )}
            </div>
        </>
    )
}

export default Lesson