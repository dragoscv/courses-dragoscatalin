/* eslint-disable @next/next/no-img-element */
import React from "react";
import Router, { useRouter } from 'next/router'
import Link from "next/link";
import LanguageSwitcher from '../../LanguageSwitcher'
import { translations } from "../../../languages";
import LoginModal from "../../LoginModal";
import ProfileModal from "../../ProfileModal";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../../../firebase.config"
import ContactModal from "../../ContactModal";

const Header = () => {
    const router = useRouter()
    const { courseId, lessonId } = router.query
    const { locale, locales, defaultLocale } = router
    const t = translations[locale || defaultLocale]
    const [openMenu, setOpenMenu] = React.useState(false);
    const [loginModal, setLoginModal] = React.useState(false)
    const [profileModal, setProfileModal] = React.useState(false)
    const [contactModal, setContactModal] = React.useState(false)
    const [user, setUser] = React.useState(null)

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    };

    const toggleLoginModal = () => {
        setLoginModal(!loginModal);
        setOpenMenu(false);
    };

    const toggleProfileModal = () => {
        setProfileModal(!profileModal)
        setOpenMenu(false);
    }

    const toggleContactModal = () => {
        setContactModal(!contactModal)
        setOpenMenu(false);
    }

    const logout = () => {
        const auth = getAuth(app);
        auth.signOut().then(() => {
            setUser(null);
            toggleMenu()
        }).catch((error) => {
            console.log(error);
        });
    }

    // React.useEffect(() => {
    //     console.log(courseId, lessonId)
    // }, [courseId, lessonId])

    React.useEffect(() => {
        const auth = getAuth(app);
        onAuthStateChanged(auth, (user) => {
            if (user && !user.isAnonymous) {
                // console.log(user)
                setUser(user)
            } else {
                setUser(null)
            }
        });
    }, [])

    const goToAdmin = () => {
        toggleMenu()
        Router.push('/admin')
    }


    return (
        <>

            <nav className="p-2 w-full top-0 left-0 z-40">
                <div className="relative container flex flex-wrap items-center justify-between mx-auto">
                    {(courseId || lessonId) && 
                        <>
                            <button className="flex items-center" onClick={() => Router.back()}>
                                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </button>
                        </>
                    }
                    <Link href="/" className="flex items-center">
                        <img src="/assets/img/logo.svg" className="h-16 mr-3 sm:h-24" alt={t.navbar.title} />
                    </Link>
                    <div className="flex flex-row items-center justify-center text-white">
                        <div className="flex md:hidden">
                            <LanguageSwitcher />
                        </div>
                        <button data-collapse-toggle="navbar-dropdown" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-dropdown" aria-expanded="false" onClick={toggleMenu}>
                            <span className="sr-only">{t.navbar.openMenu}</span>
                            <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
                        </button>
                    </div>
                    <div className={`absolute inset-0 top-14 md:relative md:top-0 w-full md:block md:w-auto ${openMenu ? 'block' : 'hidden'}`} id="navbar-dropdown">
                        <ul className="flex flex-col p-4 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                            <li className="hidden md:flex text-white">
                                <LanguageSwitcher />
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent"
                                // aria-current="page"
                                >
                                    {t.navbar.home}
                                </a>
                            </li>
                            <li>
                                <div className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent">
                                    {t.navbar.about}
                                </div>
                            </li>
                            <li>
                                <a href="#" className="block py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent" onClick={toggleContactModal}>
                                    {t.navbar.contact}
                                </a>
                            </li>

                            {user ? (
                                <>
                                    <li>
                                        <div className="block cursor-pointer py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent" onClick={toggleProfileModal}>{t.navbar.profile}</div>
                                    </li>
                                    {user.email === 'vladulescu.catalin@gmail.com' && (
                                        <li>
                                            <div className="block cursor-pointer py-2 pl-3 pr-4 text-gray-700 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 dark:text-gray-400 md:dark:hover:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent" onClick={goToAdmin}>Admin</div>
                                        </li>
                                    )}
                                    <li>
                                        <div className="block cursor-pointer py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-white dark:bg-blue-600 md:dark:bg-transparent" onClick={logout}>{t.navbar.logout}</div>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <div className="block cursor-pointer py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-white dark:bg-blue-600 md:dark:bg-transparent" onClick={toggleLoginModal}>{t.navbar.login}</div>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <LoginModal open={loginModal} onClose={toggleLoginModal} />
                <ProfileModal open={profileModal} onClose={toggleProfileModal} />
                <ContactModal open={contactModal} onClose={toggleContactModal} />
            </nav>
        </>
    );
};

export default Header;
