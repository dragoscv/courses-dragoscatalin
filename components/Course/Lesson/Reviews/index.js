import React from "react";
import { getFirestore, addDoc, setDoc, doc, collection, getDoc, getDocs, query, onSnapshot, deleteDoc } from "firebase/firestore";
import { app } from '../../../../firebase.config';

const db = getFirestore(app);

const Reviews = ({ courseId }) => {
    const [reviews, setReviews] = React.useState([]);

    return (
        <div className='container'>
            <h1>Reviews</h1>
            
        </div>
    );
};

export default Reviews;