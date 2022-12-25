import React from "react";
import Router, { useRouter } from 'next/router'
import { translations } from "../../../languages";
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebase.config";
import { Textarea } from "flowbite-react";

const db = getFirestore(app);
const storage = getStorage(app);

const AddLessonModal = (props) => {
    const [open, setOpen] = React.useState(false);
    const [saveButtonText, setSaveButtonText] = React.useState("Save lesson");
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [lessonContent, setLessonContent] = React.useState("");
    const [video, setVideo] = React.useState(null);
    const [isFree, setIsFree] = React.useState(false);

    const router = useRouter()
    const { locale, locales, defaultLocale } = router
    const t = translations[locale || defaultLocale]

    React.useEffect(() => {
        setOpen(props.open);
    }, [props.open]);

    const handleClose = () => {
        setOpen(false);
        props.onClose();
    };


    const handleAddLesson = () => {
        setSaveButtonText("Saving...");

        const lesson = {
            title: title,
            description: description,
            lessonContent: lessonContent,
            isFree: isFree,
            createdAt: new Date(),
        };

        addDoc(collection(db, `courses/${props.courseId}/lessons/`), lesson)
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
                if (video && docRef.id) {
                    const imageRef = ref(storage, `courses/${props.courseId}/videos/${video.name}`);
                    const uploadTask = uploadBytesResumable(imageRef, video);

                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log('Upload is ' + progress + '% done');
                            setSaveButtonText(`Saving... ${progress}%`);
                            switch (snapshot.state) {
                                case 'paused':
                                    console.log('Upload is paused');
                                    break;
                                case 'running':
                                    console.log('Upload is running');
                                    break;
                            }
                        },
                        (error) => {
                            console.log(error);
                        },
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                console.log('File available at', downloadURL);
                                setDoc(doc(db, `courses/${props.courseId}/lessons`, docRef.id), { video: downloadURL }, { merge: true }).then(() => {
                                    console.log("Document successfully updated!");
                                    setSaveButtonText("Save lesson");
                                    handleClose();
                                }).catch((error) => {
                                    console.error("Error updating document: ", error);
                                });
                            });
                        }
                    );
                }
                else {
                    setSaveButtonText("Save lesson");
                    handleClose();
                }
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            }
            );


    };




    return (
        <>
            <div id="add-course-modal" tabIndex="-1" aria-hidden="true" className={`${open ? 'flex' : 'hidden'} overflow-y-auto overflow-x-hidden mx-auto sm:w-full md:w-full fixed inset-0 items-center justify-center z-30 p-4 w-full md:inset-0 h-modal md:h-full`}>
                <div className="relative flex justify-center items-center w-full max-w-md h-full md:h-auto">
                    <div className="w-full relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal" onClick={handleClose}>
                            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">{t.contactModal.close}</span>
                        </button>
                        <div className="pt-4">
                            <h2 className="text-center text-2xl font-semibold text-gray-700 dark:text-gray-200 pb-2">Add new lesson</h2>
                            <div className="py-0 px-6 lg:px-8 w-full">
                                <div className="mb-6 w-full">
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                                    <input type="text" id="base-input" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                            </div>
                            <div className="py-0 px-6 lg:px-8 w-full">
                                <div className="mb-6 w-full">
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</label>
                                    <textarea id="message" rows="4" className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your description here..." value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                                </div>
                            </div>
                            <div className="py-0 px-6 lg:px-8 w-full">
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
                                        <label htmlFor="editor" className="sr-only">Publish post</label>
                                        <textarea id="editor" rows="8" className="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" placeholder="Write an article..."
                                            value={lessonContent}
                                            onChange={(e) => setLessonContent(e.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="py-0 px-6 lg:px-8 w-full">
                                <div className="mb-6 w-full">
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Video</label>
                                    <input className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="user_avatar_help" id="user_avatar" type="file"
                                        onChange={(e) => setVideo(e.target.files[0])}
                                    />
                                </div>
                            </div>
                            <div className="py-0 px-6 lg:px-8 w-full">
                                <label className="inline-flex relative items-center mb-4 cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" 
                                    onChange={(e) => setIsFree(e.target.checked)}
                                    />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-900 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-800 peer-checked:bg-blue-600"></div>
                                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Is lesson free?</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-center items-center w-full p-6 border-t border-gray-300 dark:border-gray-700">
                            <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                onClick={handleAddLesson}
                            >{saveButtonText}</button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}



export default AddLessonModal;