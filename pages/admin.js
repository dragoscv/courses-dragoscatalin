import React from 'react';
import AddCoursesModal from '../components/admin/AddCoursesModal';
import Router from 'next/router';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs } from "firebase/firestore";
import { app } from '../firebase.config';

const auth = getAuth(app);
const db = getFirestore(app);

const Admin = () => {
    const [addCourseModal, setAddCourseModal] = React.useState(false);
    const [courses, setCourses] = React.useState([]);

    const toggleAddCourseModal = () => {
        setAddCourseModal(!addCourseModal);
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
        <>
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
                    onClick={() => Router.push(`/admin/course/${course.id}`)}
                    >
                        <img className="object-cover w-full h-56" src={course.image} alt="" />
                        <div className="p-4">
                            <h4 className="mb-2 text-lg font-semibold text-gray-800 dark:text-gray-300">
                                {course.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {course.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <AddCoursesModal open={addCourseModal} onClose={toggleAddCourseModal} />
        </>
    );
}

export default Admin;