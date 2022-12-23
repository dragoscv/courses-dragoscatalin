import React from "react";
import { getAuth, sendSignInLinkToEmail, GoogleAuthProvider, signInWithPopup, OAuthProvider } from "firebase/auth";
import { app } from "../../firebase.config";
import { useRouter } from 'next/router'
import { translations } from "../../languages";

const LoginModal = (props) => {
    const [open, setOpen] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [loadingEmailLogin, setLoadingEmailLogin] = React.useState(false);
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

    const handleEmailLogin = (e) => {
        e.preventDefault();
        setLoadingEmailLogin(true);
        const auth = getAuth(app);
        const domainUrl = window.location.origin;
        sendSignInLinkToEmail(auth, email, {
            url: domainUrl,
            handleCodeInApp: true,
        })
            .then(() => {
                setLoadingEmailLogin(false);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode + errorMessage);
                setLoadingEmailLogin(false);
            });
    }

    const handleGoogleLogin = () => {
        // setLoadingGoogleLogin(true);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log(user);
                // setLoadingGoogleLogin(false);
                handleClose();
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode + errorMessage);
                // setLoadingGoogleLogin(false);
            });
    }

    const handleAppleLogin = () => {
        // setLoadingAppleLogin(true);
        const auth = getAuth(app);
        const provider = new OAuthProvider('apple.com');
        signInWithPopup(auth, provider)
            .then((result) => {
                // const credential = AppleAuthProvider.credentialFromResult(result);
                // const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                console.log(user);
                handleClose();
                // setLoadingAppleLogin(false);
            }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorCode + errorMessage);
                // setLoadingAppleLogin(false);
            });
    }

    return (
        <>
            <div id="authentication-modal" tabIndex="-1" aria-hidden="true" className={`${open ? 'flex' : 'hidden'} overflow-y-auto overflow-x-hidden mx-auto sm:w-full md:w-full fixed inset-0 items-center justify-center z-30 p-4 w-full md:inset-0 h-modal md:h-full`}>
                <div className="relative flex justify-center items-center w-full max-w-md h-full md:h-auto">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <button type="button" className="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-toggle="authentication-modal" onClick={handleClose}>
                            <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">{t.loginModal.close}</span>
                        </button>
                        <div className="py-6 px-6 lg:px-8">
                            <h3 className="mb-4 text-xl font-medium text-gray-900 dark:text-white">{t.loginModal.title}</h3>
                            <form className="space-y-6" action="#">
                                {/* <div>
                                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{t.loginModal.yourEmail}</label>
                                    <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="name@company.com" onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                                <div className="flex items-center justify-between">
                                    {!loadingEmailLogin ? (
                                        <button onClick={handleEmailLogin} className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">{t.loginModal.emailLoginButton}</button>
                                    ) : (
                                        <button disabled type="button" className="w-full py-2.5 px-5 mr-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center">
                                            <svg role="status" className="inline mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#1C64F2" />
                                            </svg>
                                            {t.loginModal.loading}
                                        </button>
                                    )}
                                </div> */}
                                <div className="flex items-center justify-between">
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
                                        {/* <li>
                                            <div className="flex items-center cursor-pointer p-3 text-base font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white" onClick={handleAppleLogin}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                                                        <path fill="#666" d="M824.66636 779.30363c-15.12299 34.93724-33.02368 67.09674-53.7638 96.66374-28.27076 40.3074-51.4182 68.2078-69.25717 83.7012-27.65347 25.4313-57.2822 38.4556-89.00964 39.1963-22.77708 0-50.24539-6.4813-82.21973-19.629-32.07926-13.0861-61.55985-19.5673-88.51583-19.5673-28.27075 0-58.59083 6.4812-91.02193 19.5673-32.48053 13.1477-58.64639 19.9994-78.65196 20.6784-30.42501 1.29623-60.75123-12.0985-91.02193-40.2457-19.32039-16.8514-43.48632-45.7394-72.43607-86.6641-31.060778-43.7024-56.597041-94.37983-76.602609-152.15586C10.740416 658.44309 0 598.01283 0 539.50845c0-67.01648 14.481044-124.8172 43.486336-173.25401C66.28194 327.34823 96.60818 296.6578 134.5638 274.1276c37.95566-22.53016 78.96676-34.01129 123.1321-34.74585 24.16591 0 55.85633 7.47508 95.23784 22.166 39.27042 14.74029 64.48571 22.21538 75.54091 22.21538 8.26518 0 36.27668-8.7405 83.7629-26.16587 44.90607-16.16001 82.80614-22.85118 113.85458-20.21546 84.13326 6.78992 147.34122 39.95559 189.37699 99.70686-75.24463 45.59122-112.46573 109.4473-111.72502 191.36456.67899 63.8067 23.82643 116.90384 69.31888 159.06309 20.61664 19.56727 43.64066 34.69027 69.2571 45.4307-5.55531 16.11062-11.41933 31.54225-17.65372 46.35662zM631.70926 20.0057c0 50.01141-18.27108 96.70693-54.6897 139.92782-43.94932 51.38118-97.10817 81.07162-154.75459 76.38659-.73454-5.99983-1.16045-12.31444-1.16045-18.95003 0-48.01091 20.9006-99.39207 58.01678-141.40314 18.53027-21.27094 42.09746-38.95744 70.67685-53.0663C578.3158 9.00229 605.2903 1.31621 630.65988 0c.74076 6.68575 1.04938 13.37191 1.04938 20.00505z" />
                                                    </g>
                                                </svg>
                                                <span className="flex-1 ml-3 whitespace-nowrap">{t.loginModal.appleLoginButton}</span>
                                            </div>
                                        </li> */}
                                    </ul>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginModal;