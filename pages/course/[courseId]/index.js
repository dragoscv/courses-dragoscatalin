
import React from 'react';
import Lessons from '../../../components/Course';
import Reviews from '../../../components/Course/Reviews';

const Course = (props) => {
    const [currentTab, setCurrentTab] = React.useState('lessons');

    return (
        <>
            <div className='w-full pb-4'>
                <ul className="w-full flex flex-wrap justify-center text-sm font-medium text-center text-gray-500 border-b border-gray-200 rounded-t-lg bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-800" id="defaultTab" data-tabs-toggle="#defaultTabContent" role="tablist">
                    <li className="mr-2">
                        <button id="about-tab" data-tabs-target="#about" type="button" role="tab" aria-controls="about" aria-selected="true" className={`inline-block p-4 ${currentTab === 'lessons' && 'text-blue-600'} rounded-tl-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 `} onClick={() => setCurrentTab('lessons')}>Lessons</button>
                    </li>
                    <li className="mr-2">
                        <button id="about-tab" data-tabs-target="#about" type="button" role="tab" aria-controls="about" aria-selected="true" className={`inline-block p-4 ${currentTab === 'reviews' && 'text-blue-600'} rounded-tl-lg hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 `} onClick={() => setCurrentTab('reviews')}>Reviews</button>
                    </li>
                </ul>
            </div>
            <div id="defaultTabContent" className='w-full px-4'>
                <div className={`${currentTab === 'lessons' ? 'flex' : 'hidden'} `} id="lessons" role="tabpanel" aria-labelledby="lessons-tab">
                    <Lessons />
                </div>
                <div className={`${currentTab === 'reviews' ? 'flex' : 'hidden'} w-full p-4 bg-white rounded-lg md:p-8 dark:bg-gray-800`} id="reviews" role="tabpanel" aria-labelledby="reviews-tab">
                    <Reviews />
                </div>
            </div>
        </>
    )
}

export default Course