import React from 'react'
import Router, { useRouter } from 'next/router'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc, orderBy, where } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../firebase.config';
import moment from 'moment/moment';
import BuyCourseModal from '../BuyCourseModal';
import Head from 'next/head';

const auth = getAuth(app)
const db = getFirestore(app)

const Lessons = (props) => {
    const [user, setUser] = React.useState(null)
    const [userData, setUserData] = React.useState(null)
    const [lessons, setLessons] = React.useState([])
    const [buyCourseModal, setBuyCourseModal] = React.useState(false)
    const [course, setCourse] = React.useState(null)
    const router = useRouter()
    const { courseId } = router.query


    const buyCourse = () => {
        setBuyCourseModal(true)
        console.log('buy course', courseId)
    }

    const toggleBuyCourseModal = () => {
        setBuyCourseModal(!buyCourseModal)
    }


    React.useEffect(() => {
        if (!courseId) return
        const queryCourse = doc(db, `courses/${courseId}`)
        getDoc(queryCourse).then((doc) => {
            if (doc.exists()) {
                const data = doc.data()
                data.id = doc.id
                setCourse(data)
            } else {
                console.log('No such document!')
            }
        }).catch((error) => {
            console.log('Error getting document:', error)
        })


        const lessons = []
        const queryLessons = query(collection(db, `courses/${courseId}/lessons`), orderBy('createdAt', 'asc'))
        onSnapshot(queryLessons, (querySnapshot) => {
            lessons.length = 0
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                data.id = doc.id
                lessons.push(data)
            })
            setLessons(lessons)
        })
    }, [courseId])

    React.useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user)
                const queryUser = doc(db, `users/${user.uid}`)
                const q = query(collection(db, `users`), where('uid', '==', user.uid))
                onSnapshot(q, (querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        const data = doc.data()
                        data.id = doc.id
                        setUserData(data)
                    })
                })
            } else {
                setUser(null)
            }
        })
    }, [])


    return (
        <div className='flex flex-col w-full'>
            <Head>
            <title>{course && course.title}</title>
        </Head>
            <div id='course-title' className="flex flex-col items-center justify-center p-4 mb-4 space-y-4 bg-white rounded-lg shadow-lg dark:bg-gray-700 transition-all">
                <div className="flex flex-col items-center justify-center space-y-1">
                    <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">{course && course.title}</p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {course && (
                            <div id="lesson-content" dangerouslySetInnerHTML={{ __html: course.description }}></div>
                        )}
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-6 p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800 w-full">
                {lessons.map((lesson) => (
                    <div key={lesson.id} className="relative flex flex-col items-center justify-center p-6 space-y-4 bg-white rounded-lg shadow-lg dark:bg-gray-700 transition-all hover:scale-105">
                        <div className="flex flex-col items-center justify-center space-y-1">
                            {lesson.isFree && (
                                <span className="absolute top-0 right-0 px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-sm transform ">Free</span>
                            )}
                            <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">{lesson.title}</p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{lesson.description}</p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{moment(lesson.createdAt.toDate()).format('DD/MM/YYYY HH:mm')}</p>
                            {lesson.isFree ? (
                                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                                    onClick={() => Router.push(`/course/${courseId}/${lesson.id}`)}
                                >
                                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                        View Lesson
                                    </span>
                                </button>
                            ) : userData && userData.courses && userData.courses.includes(courseId) ? (
                                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                                    onClick={() => Router.push(`/course/${courseId}/${lesson.id}`)}
                                >
                                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                        View Lesson
                                    </span>
                                </button>
                            ) : (
                                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                                    onClick={buyCourse}
                                >
                                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                                        Buy Course
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <BuyCourseModal open={buyCourseModal} onClose={toggleBuyCourseModal} course={course} />
        </div>
    )
}

export default Lessons