import React from 'react'
import { useRouter } from 'next/router'
import AddLessonModal from '../../../components/admin/AddLessonModal'

const Course = () => {
    const [addLessonModal, setAddLessonModal] = React.useState(false)
    const router = useRouter()
    const { courseId } = router.query

    React.useEffect(() => {
        console.log('pid', courseId)
    }, [courseId])

    const toggleAddLessonModal = () => {
        setAddLessonModal(!addLessonModal)
    }

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
            <AddLessonModal open={addLessonModal} onClose={toggleAddLessonModal} courseId={courseId} />
        </>
    )
}

export default Course