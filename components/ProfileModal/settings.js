import React from 'react'
import { app } from '../../firebase.config'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { doc, setDoc, getFirestore, getDoc } from "firebase/firestore";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const db = getFirestore(app)

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Settings = () => {
    const [user, setUser] = React.useState('')
    const [affiliateLink, setAffiliateLink] = React.useState('')
    const [walletAddress, setWalletAddress] = React.useState('')
    const [openSnackbar, setOpenSnackbar] = React.useState(false);
    const [snackbarMessage, setSnackbarMessage] = React.useState('');
    const [snackbarSeverity, setSnackbarSeverity] = React.useState('success');

    const copyToClipboard = (e) => {
        navigator.clipboard.writeText(affiliateLink)
        setSnackbarMessage('Copied to clipboard!')
        setSnackbarSeverity('success')
        setOpenSnackbar(true)
    }

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault()
        const uid = user.uid
        const docRef = doc(db, "users", uid);
        setDoc(docRef, {
            walletAddress: walletAddress
        }, { merge: true })
            .then(() => {
                setSnackbarMessage('Wallet address saved!')
                setSnackbarSeverity('success')
                setOpenSnackbar(true)
            })
    }

    React.useEffect(() => {
        const auth = getAuth(app)
        onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                // console.log(user)
                setUser(user)
            } else {
                setUser(null)
            }
        });
    }, [])

    React.useEffect(() => {
        if (!user) return
        const uid = user.uid
        const link = `https://confruntarea.ro/?uid=${uid}`
        setAffiliateLink(link)
        const docRef = doc(db, "users", uid);
        getDoc(docRef).then((doc) => {
            console.log(doc.data())
            if (doc.exists()) {
                setWalletAddress(doc.data().walletAddress)
            } else {
                setWalletAddress('')
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }, [user])

    return (
        <div className='w-full'>
            <form onSubmit={handleFormSubmit}>
                <div className="mb-6">
                    <label htmlFor="affiliateLink" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your affiliate link</label>
                    <input type="text" id="affiliateLink" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="https://confruntarea.ro/?uid=Ujx82JSn298s" onClick={copyToClipboard} value={affiliateLink} onChange={() => setAffiliateLink(affiliateLink)} />
                </div>
                <div className="mb-6">
                    <label htmlFor="walletAddress" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your wallet address</label>
                    <input type="text" id="walletAddress" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder='erd1...'
                        required
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                    />
                </div>
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Save</button>
            </form>
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default Settings