import React from "react";
import Router, { useRouter } from 'next/router'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc, where, orderBy, increment, updateDoc, arrayUnion } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../../../firebase.config';
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

const Reviews = () => {
    const router = useRouter()
    const { courseId } = router.query
    const [review, setReview] = React.useState('');
    const [reviews, setReviews] = React.useState([]);
    const [ratingValue, setRatingValue] = React.useState(5);
    const [hover, setHover] = React.useState(-1);
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

    const addReview = () => {
        addDoc(collection(db, `courses/${courseId}/reviews`), {
            rating: ratingValue,
            content: review,
            createdAt: new Date(),
            uid: user.uid,
            name: user.displayName,
            avatar: user.photoURL,
        }).then(() => {
            setReview('')
            setRatingValue(5)
            setSnackbarMessage('Review added successfully')
            setSnackbarSeverity('success')
            setOpenSnackbar(true)
        }).catch((error) => {
            console.error("Error adding document: ", error);
        });

    }

    const deleteReview = (reviewId) => {
        deleteDoc(doc(db, `courses/${courseId}/reviews`, reviewId)).then(() => {
            setSnackbarMessage('Review deleted successfully')
            setSnackbarSeverity('success')
            setOpenSnackbar(true)
        }).catch((error) => {
            console.error("Error deleting document: ", error);
        });
    }

    const handleHelpful = (reviewId) => {
        const q = query(collection(db, `courses/${courseId}/reviews`), where('id', '==', reviewId))
        //increment helpful count
        updateDoc(doc(db, `courses/${courseId}/reviews`, reviewId), {
            helpful: increment(1),
            helpfulBy: arrayUnion(user.uid)
        }).then(() => {
            setSnackbarMessage('Review marked as helpful')
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

        const q = query(collection(db, `courses/${courseId}/reviews`), orderBy('createdAt', 'desc'))
        onSnapshot(q, (querySnapshot) => {
            const reviews = []
            querySnapshot.forEach((doc) => {
                const data = doc.data()
                data.id = doc.id
                reviews.push(data)
            })
            setReviews(reviews)
        })
    }, [courseId])

    return (
        <>
            <div className="flex flex-col w-full">
                {boughtCourse && (
                    <div id="add-review" className="w-full">
                        <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                            <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                                <label for="comment" className="sr-only">Your review</label>
                                <textarea id="comment" rows="4" className="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" placeholder="Write a review..." required
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                                <div className="flex pl-0 space-x-1 sm:pl-2">
                                    <Rating
                                        name="hover-feedback"
                                        value={ratingValue}
                                        precision={0.5}
                                        getLabelText={getLabelText}
                                        onChange={(event, newValue) => {
                                            setRatingValue(newValue);
                                        }}
                                        onChangeActive={(event, newHover) => {
                                            setHover(newHover);
                                        }}
                                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                    />
                                    {ratingValue !== null && (
                                        <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : ratingValue]}</Box>
                                    )}
                                </div>
                                <button className="inline-flex items-center py-2.5 px-4 text-xs font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800"
                                    onClick={addReview}
                                >
                                    Post review
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                <div id="reviews" className="w-full">
                    {reviews.map((review, index) => (
                        <>
                            <article key={review.id} className="py-4 px-2">
                                <div className="flex items-center mb-4 space-x-4">
                                    <img className="w-10 h-10 rounded-full" src={review.avatar} alt="" />
                                    <div className="space-y-1 font-medium dark:text-white">
                                        <p>{review.name}
                                            <time dateTime={moment(review.createdAt.toDate()).format('DD/MM/YYYY HH:mm')} className="block text-sm text-gray-500 dark:text-gray-400">Posted on {moment(review.createdAt.toDate()).format('DD/MM/YYYY HH:mm')}</time>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center mb-1">
                                    <Rating
                                        name="hover-feedback"
                                        value={review.rating}
                                        precision={0.5}
                                        getLabelText={getLabelText}
                                        readOnly
                                        emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                                    />
                                    {review.rating !== null && (
                                        <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : review.rating]}</Box>
                                    )}
                                </div>
                                <p className="mb-2 font-light text-gray-500 dark:text-gray-400">{review.content}</p>
                                <aside>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{review.helpful} people found this helpful</p>
                                    <div className="flex items-center mt-3 space-x-3 divide-x divide-gray-200 dark:divide-gray-600">
                                        {isAdmin && (
                                            <div className="cursor-pointer text-gray-900 bg-red border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-xs px-2 py-1.5 dark:bg-red-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                                onClick={() => deleteReview(review.id)}
                                            >Delete</div>
                                        )}
                                        {review && !review.helpfulBy?.includes(user.uid) && (
                                            <div className="cursor-pointer text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-xs px-2 py-1.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                                onClick={() => handleHelpful(review.id)}
                                            >Helpful</div>
                                        )}
                                        <a href="#" className="pl-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-500">Report abuse</a>
                                    </div>
                                </aside>
                            </article>
                            <hr className="border-gray-200 dark:border-gray-600" />
                        </>
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

export default Reviews;