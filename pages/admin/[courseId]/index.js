import React from 'react'
import Router, { useRouter } from 'next/router'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc } from "firebase/firestore";
import { app } from '../../../firebase.config';
import AddLessonModal from '../../../components/admin/AddLessonModal'
import EditLessonModal from '../../../components/admin/EditLessonModal'
import moment from 'moment/moment';

const db = getFirestore(app)

const Course = () => {
    const [addLessonModal, setAddLessonModal] = React.useState(false)
    const [editLessonModal, setEditLessonModal] = React.useState(false)
    const [editLessonId, setEditLessonId] = React.useState(null)
    const [lessons, setLessons] = React.useState([])
    const router = useRouter()
    const { courseId } = router.query



    const toggleAddLessonModal = () => {
        setAddLessonModal(!addLessonModal)
    }

    const deleteLesson = (lesson) => {
        const lessonRef = doc(db, `courses/${courseId}/lessons`, lesson.id)
        deleteDoc(lessonRef).then(() => {
            console.log('Lesson deleted')
            const newLessons = lessons.filter((c) => c.id !== lessons.id);
            setLessons(newLessons);
        }).catch((error) => {
            console.log('Error deleting lesson: ', error)
        })
    }


    React.useEffect(() => {
        if (!courseId) return
        const lessons = []
        const q = query(collection(db, `courses/${courseId}/lessons`))
        onSnapshot(q, (querySnapshot) => {
            lessons.length = 0
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                data.id = doc.id
                lessons.push(data)
            })
            setLessons(lessons)
        })
    }, [courseId])


    return (
        <>
            <div>
                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                    onClick={toggleAddLessonModal}
                >
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Add new Lesson
                    </span>
                </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mx-4">
                {lessons.map((lesson) => (
                    <div key={lesson.id} className="relative flex flex-col items-center justify-center p-6 space-y-4 bg-white rounded-lg shadow-lg dark:bg-gray-800">
                        <div className="flex flex-col items-center justify-center space-y-1">
                            <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">{lesson.title}</p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{lesson.description}</p>
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{moment(lesson.createdAt.toDate()).format('DD/MM/YYYY HH:mm')}</p>
                            {lesson.isFree && (
                                <span className="absolute top-0 left-0 px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded-sm transform ">Free</span>
                            )}
                            <button className="absolute top-0 right-0 px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-sm transform"
                            onClick={() => {
                                setEditLessonId(lesson.id)
                                setEditLessonModal(true)
                            }}
                            >Edit</button>
                            <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                                onClick={() => deleteLesson(lesson)}
                            >Delete</button>
                        </div>
                    </div>
                ))}
            </div>
            <AddLessonModal open={addLessonModal} onClose={toggleAddLessonModal} courseId={courseId} />
            <EditLessonModal open={editLessonModal} onClose={setEditLessonModal} lessonId={editLessonId} courseId={courseId} />
        </>
    )
}

export default Course