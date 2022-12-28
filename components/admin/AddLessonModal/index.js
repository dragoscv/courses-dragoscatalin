import React from "react";
import Router, { useRouter } from 'next/router'
import { translations } from "../../../languages";
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebase.config";
import { DefaultEditor } from 'react-simple-wysiwyg';

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
                                }).catch((error) => {
                                    console.error("Error updating document: ", error);
                                });
                            });
                        }
                    );
                }
                setSaveButtonText("Save lesson");
                handleClose();
                setTitle("");
                setDescription("");
                setLessonContent("");
                setVideo(null);
                setIsFree(false);
                
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
                                <div className="mb-6 w-full">
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Lesson Content</label>
                                    <DefaultEditor value={lessonContent} onChange={(e) => setLessonContent(e.target.value)} />
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