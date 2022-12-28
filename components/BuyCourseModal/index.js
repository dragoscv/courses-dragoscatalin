import React from 'react'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from '../../firebase.config';
import { paymentGatewayUrl } from '../../config';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { useRouter } from 'next/router'
import { translations } from "../../languages";

const db = getFirestore(app)
const auth = getAuth(app);
const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const BuyCourseModal = (props) => {
    const { course } = props;
    const [user, setUser] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [transactionId, setTransactionId] = React.useState(null);
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');
    const router = useRouter()
    const { locale, locales, defaultLocale } = router
    const t = translations[locale || defaultLocale]

    const handleBuy = (type) => {
        // console.log('Buy');
        const transaction = {
            userId: user.uid,
            courseId: course.id,
            amount: course.price * 100,
            status: 'pending',
            paymentMethod: type,
            currency: course.currency,
            createdAt: new Date(),
        }
        const createPaymentInDatabase = async () => {
            //create transaction in database
            if (transactionId) {
                return transactionId;
            }
            const docRef = await addDoc(collection(db, 'transactions'), transaction);
            setTransactionId(docRef.id);
            console.log('Document written with ID: ', docRef.id);
            return docRef.id;
        }
        const paymentWindowRef = window.open('about:blank', '_blank', 'width=400,height=700');
        createPaymentInDatabase().then((id) => {
            if (type === 'card' || type === 'crypto') {
                //open a new window with the payment gateway
                const currentDomain = window.location.origin;
                const paymentUrl = `${paymentGatewayUrl}/?transactionId=${id}&amount=${transaction.amount}&currency=${transaction.currency}&widgetType=card-field&callbackURL=${currentDomain}&name=${user.displayName}&email=${user.email}&phone=${user.phoneNumber}&type=${type}`;
                paymentWindowRef.location = paymentUrl;
                //listen for the payment window to close
                const interval = setInterval(() => {
                    paymentWindowRef.closed && clearInterval(interval);
                    // console.log(paymentWindowRef)

                    if (paymentWindowRef.closed) {
                        //payment window closed
                        //show snackbar
                        const docRef = doc(db, 'transactions', id);
                        const unsubscribe = onSnapshot(docRef, (querySnapshot) => {
                            const data = querySnapshot.data();
                            // console.log('Current data: ', data);
                            if (data.status === 'completed') {
                                //close the dialog
                                handleClose();
                                // setOpen(false);
                                setTransactionId(null);
                                //show snackbar
                                setSnackbarMessage('Payment completed successfully');
                                setSnackbarSeverity('success');
                                setOpenSnackbar(true);
                                // setLoadingCardPayment(false);
                                unsubscribe();
                            } else {
                                setSnackbarMessage('Payment cancelled');
                                setSnackbarSeverity('error');
                                setOpenSnackbar(true);
                                unsubscribe();
                            }
                        });
                    }
                }, 1000);
            }
        });
    }

    const handleClose = React.useCallback(() => {
        setOpen(false);
        props.onClose();
    }, [props]);

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

    const handleGoogleLogin = () => {
        // setLoadingGoogleLogin(true);
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log(user);
                // setLoadingGoogleLogin(false);
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode + errorMessage);
                // setLoadingGoogleLogin(false);
            });
    }

    React.useEffect(() => {
        const auth = getAuth(app);
        onAuthStateChanged(auth, (user) => {
            if (user) {
                // console.log(user)
                setUser(user);
            } else {
                setUser(null);
            }
        });
    }, [])

    React.useEffect(() => {
        // console.log(props)
        setOpen(props.open);
    }, [props]);

    return (
        <>

            <div className={`${open ? 'flex' : 'hidden'} overflow-y-auto overflow-x-hidden mx-auto sm:w-full md:w-full fixed inset-0 items-center justify-center z-20 p-4 w-full md:inset-0 h-modal md:h-full`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                <div className="bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    {user && !user.isAnonymous ? (
                        <>
                            <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                            Buy Course {course?.title}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Are you sure you want to buy this course? You can cancel at any time.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <div className="flex flex-row w-full justify-between rounded-md shadow-sm sm:mt-0 sm:w-auto">
                                    <button type="button" className="w-1/2 m-2 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-br from-purple-600 to-blue-500 text-base font-medium text-white hover:from-purple-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => handleBuy('card')}
                                    >
                                        Pay with card
                                    </button>
                                    <button type="button" className="w-1/2 m-2 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-br from-purple-600 to-blue-500 text-base font-medium text-white hover:from-purple-600 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => handleBuy('crypto')}
                                    >
                                        Pay with crypto
                                    </button>
                                </div>
                                <button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white dark:bg-gray-900 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" onClick={handleClose}>
                                    Cancel
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                            Buy Course {course?.title}
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                               You have to login to buy this course.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-center">
                                <ul className="my-4 space-y-3">
                                    <li>
                                        <div className="flex items-center cursor-pointer p-3 text-base font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white" onClick={handleGoogleLogin}>
                                            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                                                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                                                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                                                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                                                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
                                                </g>
                                            </svg>
                                            <span className="flex-1 ml-3 whitespace-nowrap">{t.loginModal.googleLoginButton}</span>
                                            <span className="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">Popular</span>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </>
                    )}
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

export default BuyCourseModal;
