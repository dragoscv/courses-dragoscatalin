import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query } from "firebase/firestore";
import Router from 'next/router';
import React from 'react';
import AddCoursesModal from '../../components/admin/AddCoursesModal';
import EditCourseModal from "../../components/admin/EditCourseModal";
import { app } from '../../firebase.config';

const auth = getAuth(app);
const db = getFirestore(app);

const Admin = () => {
    const [addCourseModal, setAddCourseModal] = React.useState(false);
    const [editCourseModal, setEditCourseModal] = React.useState(false);
    const [courses, setCourses] = React.useState([]);
    const [courseId, setCourseId] = React.useState(null);

    const toggleAddCourseModal = () => {
        setAddCourseModal(!addCourseModal);
    };

    const toggleEditCourseModal = () => {
        setEditCourseModal(!editCourseModal);
    };

    const editCourse = (course) => {
    };

    const deleteCourse = (course) => {
        deleteDoc(doc(db, "courses", course.id));
        const newCourses = courses.filter((c) => c.id !== course.id);
        setCourses(newCourses);
    };

    React.useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if (!user) {
                console.log('No user signed in.');
                Router.push('/');
            } else {
                console.log('User signed in: ', user)
                if (user.email === 'vladulescu.catalin@gmail.com') {
                    console.log('Admin logged in');
                } else {
                    console.log('Not admin');
                    Router.push('/');
                }
            }
        });
    }, []);

    React.useEffect(() => {
        const courses = [];
        const q = query(collection(db, "courses"));
        onSnapshot(q, (querySnapshot) => {
            courses.length = 0;
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                data.id = doc.id;
                courses.push(data);
            });
            setCourses(courses);
        });

    }, []);

    return (
        <div className='container'>
            <div>
                <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
                    onClick={toggleAddCourseModal}
                >
                    <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                        Add new course
                    </span>
                </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                    <div key={course.id} className="cursor-pointer overflow-hidden transition-all transform bg-white rounded-lg shadow-sm dark:bg-gray-800 hover:scale-105 w-full"
                    >
                        <img className="object-cover w-full h-56" src={course.image} alt="" onClick={() => Router.push(`/admin/${course.id}`)} />
                        <div className="p-4">
                            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-300">
                                {course.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {course.description}
                            </p>
                            <button className="absolute top-0 right-0 p-2 m-2 text-gray-400 bg-white rounded-full shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 dark:focus:ring-white"
                                onClick={() => {
                                    toggleEditCourseModal()
                                    setCourseId(course.id)
                                }}
                            >
                                <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 6a2 2 0 012-2h8a2 2 0 012 2v2a1 1 0 11-2 0V6H6v2a1 1 0 11-2 0V6z" clipRule="evenodd" />
                                    <path fillRule="evenodd" d="M3 8a1 1 0 011-1h12a1 1 0 011 1v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm1 0v9a1 1 0 001 1h10a1 1 0 001-1V8H4z" clipRule="evenodd" />
                                </svg>
                            </button>
                            <button type="button" className="absolute bottom-0 right-0 p-2 m-2 text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2"

                                onClick={() => deleteCourse(course)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <AddCoursesModal open={addCourseModal} onClose={toggleAddCourseModal} />
            <EditCourseModal open={editCourseModal} onClose={toggleEditCourseModal} courseId={courseId} />
        </div>
    );
}

export default Admin;