import React from "react";
import { useRouter } from 'next/router'
import { translations } from "../../languages";

const ContactModal = (props) => {
    const [open, setOpen] = React.useState(false);
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



    return (
        <>
            <div id="contact-modal" tabIndex="-1" aria-hidden="true" className={`${open ? 'flex' : 'hidden'} overflow-y-auto overflow-x-hidden mx-auto sm:w-full md:w-full fixed inset-0 items-center justify-center z-30 p-4 w-full md:inset-0 h-modal md:h-full`}>
                <div className="relative flex justify-center items-center w-full max-w-md h-full md:h-auto">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal" onClick={handleClose}>
                            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">{t.contactModal.close}</span>
                        </button>
                        <div className="py-6 px-6 lg:px-8">
                            <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">{t.contactModal.title}</h3>
                            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{t.contactModal.content} <a className="text-blue-500" href='https://dragoscatalin.ro' target='_blank' rel='noreferrer'>dragoscatalin.ro</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ContactModal;