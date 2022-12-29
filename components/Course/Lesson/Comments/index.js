import React from "react";
import Router, { useRouter } from 'next/router'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc, where, orderBy, increment, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../../../firebase.config';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import moment from "moment";

const db = getFirestore(app);
const auth = getAuth(app);

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const labels = {
    0.5: 'Useless',
    1: 'Useless+',
    1.5: 'Poor',
    2: 'Poor+',
    2.5: 'Ok',
    3: 'Ok+',
    3.5: 'Good',
    4: 'Good+',
    4.5: 'Excellent',
    5: 'Excellent+',
};

function getLabelText(value) {
    return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}

const Comments = () => {
    const router = useRouter()
    const { courseId } = router.query
    const [comment, setComment] = React.useState('');
    const [comments, setComments] = React.useState([]);
    const [user, setUser] = React.useState(null)
    const [userData, setUserData] = React.useState(null)
    const [boughtCourse, setBoughtCourse] = React.useState(false)
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
    const [isAdmin, setIsAdmin] = React.useState(false)

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const addComment = () => {
        addDoc(collection(db, `courses/${courseId}/comments`), {
            content: comment,
            createdAt: new Date(),
            uid: user.uid,
            name: user.displayName,
            avatar: user.photoURL,
        }).then(() => {
            setComment('')
            setSnackbarMessage('Review added successfully')
            setSnackbarSeverity('success')
            setOpenSnackbar(true)
        }).catch((error) => {
            console.error("Error adding document: ", error);
        });

    }

    const deleteReview = (commentId) => {
        deleteDoc(doc(db, `courses/${courseId}/`, commentId)).then(() => {
            setSnackbarMessage('Comment deleted successfully')
            setSnackbarSeverity('success')
            setOpenSnackbar(true)
        }).catch((error) => {
            console.error("Error deleting document: ", error);
        });
    }

    const handleHelpful = (commentId) => {
        const q = query(collection(db, `courses/${courseId}/comments`), where('id', '==', commentId))
        //increment helpful count
        updateDoc(doc(db, `courses/${courseId}/comments`, commentId), {
            helpful: increment(1),
            helpfulBy: arrayUnion(user.uid)
        }).then(() => {
            setSnackbarMessage('Comment marked as helpful')
            setSnackbarSeverity('success')
            setOpenSnackbar(true)
        }).catch((error) => {
            console.error("Error updating document: ", error);
        });
    }


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
                        if (data?.admin) {
                            setIsAdmin(true)
                        }
                        setUserData(data)
                        if (data && data.courses?.includes(courseId)) {
                            setBoughtCourse(true)
                        }
                    })
                })
            } else {
                setUser(null)
            }
        })

        const q = query(collection(db, `courses/${courseId}/comments`), orderBy('createdAt', 'desc'))
        onSnapshot(q, (querySnapshot) => {
            const comments = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                data.id = doc.id
                comments.push(data)
            })
            setComments(comments)
        })
    }, [courseId])

    return (
        <>
            <div className="flex flex-col w-full">
                {boughtCourse && (
                    <div id="add-review" className="w-full">
                        <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                                <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
                                    <div className="flex flex-wrap items-center divide-gray-200 sm:divide-x dark:divide-gray-600">
                                        <div className="flex items-center space-x-1 sm:pr-4">
                                            <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd"></path></svg>
                                                <span className="sr-only">Attach file</span>
                                            </button>
                                            <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                                                <span className="sr-only">Embed map</span>
                                            </button>
                                            <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path></svg>
                                                <span className="sr-only">Upload image</span>
                                            </button>
                                            <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                                <span className="sr-only">Format code</span>
                                            </button>
                                            <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd"></path></svg>
                                                <span className="sr-only">Add emoji</span>
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap items-center space-x-1 sm:pl-4">
                                            <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                                                <span className="sr-only">Add list</span>
                                            </button>
                                            <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>
                                                <span className="sr-only">Settings</span>
                                            </button>
                                            <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
                                                <span className="sr-only">Timeline</span>
                                            </button>
                                            <button type="button" className="p-2 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                                                <span className="sr-only">Download</span>
                                            </button>
                                        </div>
                                    </div>
                                    <button type="button" data-tooltip-target="tooltip-fullscreen" className="p-2 text-gray-500 rounded cursor-pointer sm:ml-auto hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
                                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                                        <span className="sr-only">Full screen</span>
                                    </button>
                                    <div id="tooltip-fullscreen" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700">
                                        Show full screen
                                        <div className="tooltip-arrow" data-popper-arrow></div>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-white rounded-b-lg dark:bg-gray-800">
                                    <label htmlFor="editor" className="sr-only">Publish comment</label>
                                    <textarea id="editor" rows="8" className="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" placeholder="Write a comment..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="flex items-center justify-end px-3 py-2 border-t dark:border-gray-600">

                                <button className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                                    onClick={addComment}
                                >
                                    Post comment
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div id="reviews" className="w-full">
                    {comments.map((comment, index) => (
                        <div key={comment.id}>
                            <article className="py-4 px-2">
                                <div className="flex items-center mb-4 space-x-4">
                                    <img className="w-10 h-10 rounded-full" src={comment.avatar} alt="" />
                                    <div className="space-y-1 font-medium dark:text-white">
                                        <p>{comment.name}
                                            <time dateTime={moment(comment.createdAt.toDate()).format('DD/MM/YYYY HH:mm')} className="block text-sm text-gray-500 dark:text-gray-400">Posted on {moment(comment.createdAt.toDate()).format('DD/MM/YYYY HH:mm')}</time>
                                        </p>
                                    </div>
                                </div>
                                <p className="mb-2 font-light text-gray-500 dark:text-gray-400">{comment.content}</p>
                                <aside>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{comment.helpful > 0 ? comment.helpful : '0'} people found this helpful </p>
                                    <div className="flex items-center mt-3 space-x-3 divide-x divide-gray-200 dark:divide-gray-600">
                                        {(isAdmin || comment.uid === user.uid) && (
                                            <div className="cursor-pointer text-gray-900 bg-red border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-xs px-2 py-1.5 dark:bg-red-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                                onClick={() => deleteReview(comment.id)}
                                            >Delete</div>
                                        )}
                                        {comment && !comment.helpfulBy?.includes(user.uid) && (
                                            <div className="cursor-pointer text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-xs px-2 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                                onClick={() => handleHelpful(comment.id)}
                                            >Helpful</div>
                                        )}
                                        <a href="#" className="pl-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">Report abuse</a>
                                    </div>
                                </aside>
                            </article>
                            <hr className="border-gray-200 dark:border-gray-600" />
                        </div>
                    ))}
                </div>
            </div>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </>
    );
};

export default Comments;