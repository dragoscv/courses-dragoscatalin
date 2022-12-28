import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getFirestore, onSnapshot, query } from 'firebase/firestore';
import moment from 'moment';
import React from 'react';
import { app } from '../../firebase.config';

const db = getFirestore(app);

const ProfileModal = (props) => {
    const [open, setOpen] = React.useState(false);
    const [currentTab, setCurrentTab] = React.useState('purchases');
    const [purchases, setPurchases] = React.useState([]);
    const [user, setUser] = React.useState({});
    const [courses, setCourses] = React.useState([]);

    const handleClose = () => {
        setOpen(false);
        props.onClose();
    };

    React.useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    React.useEffect(() => {
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                // console.log(user)
                setUser(user)
            } else {
                setUser(null)
            }
        });
    }, []);

    React.useEffect(() => {
        if (!user) return;
        // console.log(user.uid)
        const q = query(collection(db, 'transactions'));
        onSnapshot(q, (snapshot) => {
            const purchases = [];
            snapshot.forEach((doc) => {
                if (doc.data().status === 'completed' && doc.data().userId === user.uid) {
                    let data = doc.data();
                    data.transactionId = doc.id;
                    // console.log(data)
                    purchases.push(data);
                }
            });
            setPurchases(purchases);
        });
    }, [user]);

    React.useEffect(() => {
        const q = query(collection(db, 'courses'));
        onSnapshot(q, (snapshot) => {
            const courses = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                data.courseId = doc.id;
                courses[data.courseId] = data;
            });
            console.log(courses)
            setCourses(courses);
        });
    }, []);





    return (
        <div id="profile-modal" tabIndex="-1" aria-hidden="true" className={`${open ? 'flex' : 'hidden'} overflow-y-auto overflow-x-hidden mx-auto sm:w-full md:w-full fixed inset-0 items-center justify-center z-150 p-4 w-full md:inset-0 h-modal md:h-full`}>
            <div className="relative flex justify-center items-center w-full max-w-md h-full md:h-auto">
                <div className="w-full bg-white border rounded-lg shadow-md dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-start justify-between p-4 rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Your Profile
                        </h3>
                        <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-toggle="defaultModal" onClick={handleClose}>
                            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-t-lg bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800" id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
                        <li className="mr-2">
                            <button id="about-tab" data-tabs-target="#about" type="button" role="tab" aria-controls="about" aria-selected="true" className={`inline-block p-4 ${currentTab === 'purchases' && 'text-blue-600'} rounded-tl-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 `} onClick={() => setCurrentTab('purchases')}>Purchases</button>
                        </li>
                        {/* <li className="mr-2">
                            <button id="about-tab" data-tabs-target="#about" type="button" role="tab" aria-controls="about" aria-selected="true" className={`inline-block p-4 ${currentTab === 'nfts' && 'text-blue-600'} rounded-tl-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 `} onClick={() => setCurrentTab('nfts')}>Your NFT&apos;s</button>
                        </li> */}
                        <li className="mr-2">
                            <button id="about-tab" data-tabs-target="#about" type="button" role="tab" aria-controls="about" aria-selected="true" className={`inline-block p-4 ${currentTab === 'settings' && 'text-blue-600'} rounded-tl-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 `} onClick={() => setCurrentTab('settings')}>Settings</button>
                        </li>
                    </ul>
                    <div id="defaultTabContent">
                        <div className={`${currentTab === 'purchases' ? 'flex' : 'hidden'} p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800`} id="about" role="tabpanel" aria-labelledby="about-tab">
                            <div className="flex items-center justify-between w-full">
                                <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700 w-full">
                                    {purchases.map((purchase, index) => (
                                        <li key={index} className="py-3 sm:py-4 w-full">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex-shrink-0">
                                                    
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate dark:text-white">
                                                        {courses && courses[purchase.courseId] ? courses[purchase.courseId].title : 'Course not found'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate dark:text-gray-400">

                                                        {moment(purchase.createdAt.toDate()).format('MMMM Do YYYY, h:mm:ss')}
                                                    </p>
                                                </div>
                                                <div className="inline-flex items-center text-base font-semibold text-gray-900 dark:text-white">
                                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: purchase.currency }).format(purchase.amount / 100)}
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        <div className={`${currentTab === 'settings' ? 'flex' : 'hidden'} p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800`} id="statistics" role="tabpanel" aria-labelledby="statistics-tab">
                            {/* <Settings /> */}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default ProfileModal;