import React from 'react'
import Router, { useRouter } from 'next/router'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc, orderBy, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../../firebase.config';
import moment from 'moment/moment';

const db = getFirestore(app)
const auth = getAuth(app)

const Lesson = () => {
    const router = useRouter()
    const { courseId, lessonId } = router.query
    const [lesson, setLesson] = React.useState(null)
    const [videoWidth, setVideoWidth] = React.useState('300px')
    const [videoHeight, setVideoHeight] = React.useState('200px')
    const [previousLessonId, setPreviousLessonId] = React.useState(null)
    const [nextLessonId, setNextLessonId] = React.useState(null)
    const [currentLessonIndex, setCurrentLessonIndex] = React.useState(null)
    const [isFirstLesson, setIsFirstLesson] = React.useState(false)
    const [isLastLesson, setIsLastLesson] = React.useState(false)

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
        const queryLessons = query(collection(db, `courses/${courseId}/lessons`), orderBy('createdAt', 'asc'))
        getDoc(queryLesson).then((doc) => {
            if (doc.exists()) {
                const data = doc.data()
                data.id = doc.id
                console.log('Document data:', data)
                setLesson(data)
                //get previous lesson id and next lesson id
                onSnapshot(queryLessons, (querySnapshot) => {
                    const lessons = []
                    querySnapshot.forEach((doc) => {
                        const data = doc.data()
                        data.id = doc.id
                        lessons.push(data)
                    })
                    // console.log('lessons', lessons)
                    const lessonIndex = lessons.findIndex((lesson) => lesson.id === lessonId)
                    // console.log('lessonIndex', lessonIndex)
                    setCurrentLessonIndex(lessonIndex)
                    if (lessonIndex === 0) {
                        setIsFirstLesson(true)
                    }
                    if (lessonIndex > 0) {
                        setPreviousLessonId(lessons[lessonIndex - 1].id)
                    }
                    if (lessonIndex < lessons.length - 1) {
                        setNextLessonId(lessons[lessonIndex + 1].id)
                    }
                    if (lessonIndex === lessons.length - 1) {
                        setIsLastLesson(true)
                    }
                })
            } else {
                console.log('No such document!')
            }
        }).catch((error) => {
            console.log('Error getting document:', error)
        })
    }, [courseId, lessonId])

    //get video progress
    React.useEffect(() => {
        const video = player.current
        if (!video) return
        console.log('video', video)
        video.ontimeupdate = () => {
            console.log('video.currentTime', video.currentTime)
        }
    }, [])

    React.useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                const q = query(collection(db, `users`), where('uid', '==', user.uid))
                onSnapshot(q, (querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data()
                        data.id = doc.id
                        //check if user bought course or not and redirect to course page if not
                        if (lesson && lesson.isFree === false) {
                            if (!data.courses.includes(courseId)) {
                                Router.push(`/course/${courseId}`)
                            }
                        }

                    })
                })
            } else {
                setUser(null)
            }
        })
    }, [courseId, lesson])


    return (
        <div className='p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 w-full'>
            <div className='flex flex-col justify-center items-center w-full'>
                {lesson && (
                    <>
                        <div className='grid grid-cols-3 items-center justify-center w-full'>
                            <div className='flex flex-col items-center justify-center'>
                                {previousLessonId && (
                                    <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800"
                                        onClick={() => Router.push(`/course/${courseId}/${previousLessonId}`)}
                                    >
                                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                            Previous <br /> lesson
                                        </span>
                                    </button>
                                )}
                            </div>
                            <div className='flex flex-col items-center justify-center'>
                                <h1 className="text-xl font-bold">
                                    {lesson.title}
                                </h1>
                            </div>
                            <div className='flex flex-col items-center justify-center'>
                                {nextLessonId && (
                                    <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                                        onClick={() => Router.push(`/course/${courseId}/${nextLessonId}`)}
                                    >
                                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                            Next <br /> lesson
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>


                        <div className='player-wrapper py-4'>
                            <video
                                ref={player}
                                src={lesson.video}
                                width={videoWidth}
                                height={videoHeight}
                                controls
                            />

                        </div>
                        <p>{lesson.description}</p>
                        <p>{moment(lesson.createdAt.toDate()).format('DD/MM/YYYY')}</p>
                        <div id="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.lessonContent }}></div>

                    </>
                )}
            </div>
        </div>
    )
}

export default Lesson