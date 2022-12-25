import React from 'react'
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from '../../firebase.config';
import { paymentGatewayUrl } from '../../config';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

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
                    <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                    Buy Course {course?.id}
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
