import React from "react";
import { useRouter } from 'next/router'
import { translations } from "../../../languages";
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { app } from "../../../firebase.config";

const db = getFirestore(app);
const storage = getStorage(app);

const AddCoursesModal = (props) => {
    const [open, setOpen] = React.useState(false);
    const [saveButtonText, setSaveButtonText] = React.useState("Save course");
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [price, setPrice] = React.useState("");
    const [currency, setCurrency] = React.useState("EUR");
    const [image, setImage] = React.useState(null);
    const [category, setCategory] = React.useState("Web Development");
    const [instructor, setInstructor] = React.useState("");
    const [language, setLanguage] = React.useState("Romanian");

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


    const handleAddCourse = () => {
        setSaveButtonText("Saving...");

        const course = {
            title: title,
            description: description,
            price: price,
            currency: currency,
            category: category,
            instructor: instructor,
            language: language,
            createdAt: new Date(),
        };

        addDoc(collection(db, "courses"), course)
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
                if (image && docRef.id) {
                    const imageRef = ref(storage, `courses/${docRef.id}/images/${image.name}`);
                    const uploadTask = uploadBytesResumable(imageRef, image);

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
                                setDoc(doc(db, "courses", docRef.id), { image: downloadURL }, { merge: true }).then(() => {
                                    console.log("Document successfully updated!");
                                    setSaveButtonText("Save course");
                                    handleClose();
                                    setTitle("");
                                    setDescription("");
                                    setPrice("");
                                    setCurrency("RON");
                                    setImage(null);
                                    setCategory("");
                                    setInstructor("");
                                    setLanguage("ro");
                                }).catch((error) => {
                                    console.error("Error updating document: ", error);
                                });
                            });
                        }
                    );
                } else {
                    setSaveButtonText("Save course");
                    handleClose();
                    setTitle("");
                    setDescription("");
                    setPrice("");
                    setCurrency("RON");
                    setImage(null);
                    setCategory("");
                    setInstructor("");
                    setLanguage("ro");
                }

            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            }
            );


    };




    return (
        <div className={`${open ? 'flex' : 'hidden'} absolute w-full top-10`}>
            <div id="add-course-modal" tabIndex="-1" aria-hidden="true" className={`${open ? 'flex' : 'hidden'} overflow-y-visible overflow-x-hidden mx-auto sm:w-full md:w-full flex items-center justify-center z-30 p-4 w-full h-full`}>
                <div className="relative flex justify-center items-center w-full max-w-md">
                    <div className="w-full h-full relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal" onClick={handleClose}>
                            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">{t.contactModal.close}</span>
                        </button>
                        <div className="pt-4 h-full">
                            <h2 className="text-center text-2xl font-semibold text-gray-700 dark:text-gray-200 pb-2">Add new course</h2>
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
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Instructor</label>
                                    <input type="text" id="base-input" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Instructor name" value={instructor} onChange={(e) => setInstructor(e.target.value)} />
                                </div>
                            </div>
                            <div className="py-0 px-6 lg:px-8 w-full">
                                <div className="mb-6 w-full">
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Language</label>
                                    <select className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                        <option value="English">English</option>
                                        <option value="Romanian">Romanian</option>
                                    </select>
                                </div>
                            </div>
                            <div className="py-0 px-6 lg:px-8 w-full">
                                <div className="mb-6 w-full">
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</label>
                                    <select className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="Web Development">Web Development</option>
                                        <option value="Mobile Development">Mobile Development</option>
                                        <option value="Data Science">Data Science</option>
                                        <option value="Design">Design</option>
                                        <option value="Business">Business</option>
                                        <option value="Marketing">Marketing</option>
                                        <option value="Photography">Photography</option>
                                        <option value="Music">Music</option>
                                        <option value="Lifestyle">Lifestyle</option>
                                        <option value="Health & Fitness">Health & Fitness</option>
                                        <option value="Language">Language</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="py-0 px-6 lg:px-8 w-full">
                                <div className="mb-6 w-full">
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</label>
                                    <input type="number" id="base-input" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={price} onChange={(e) => setPrice(e.target.value)} />
                                </div>
                            </div>
                            <div className="py-0 px-6 lg:px-8 w-full">
                                <div className="mb-6 w-full">
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Currency</label>
                                    <select id="base-input" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                                        <option value="RON">RON</option>
                                        <option value="EUR">EUR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>
                            <div className="py-0 px-6 lg:px-8 w-full">
                                <div className="mb-6 w-full">
                                    <label htmlFor="base-input" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Image</label>
                                    <input className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" aria-describedby="user_avatar_help" id="user_avatar" type="file"
                                        onChange={(e) => setImage(e.target.files[0])}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-center items-center w-full p-6 border-t border-gray-300 dark:border-gray-700">
                            <button className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                onClick={handleAddCourse}
                            >{saveButtonText}</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}



export default AddCoursesModal;