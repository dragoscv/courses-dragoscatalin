// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import NextCors from 'nextjs-cors';
import { getFirestore, updateDoc, doc, getDoc, setDoc, query, collection, arrayUnion } from 'firebase/firestore';
import { app } from '../../firebase.config';
import { apiKey } from '../../config';

const db = getFirestore(app);

export default async function handler(req, res) {
  await NextCors(req, res, {
    // Options
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    origin: '*.dragoscatalin.ro',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  console.log(req.headers);
  console.log(req.query)
  const authToken = req.headers.authorization?.split(' ')[1];
  const { method, body } = req;
  const { id } = req.query;
  if (method === 'POST') {
    if (authToken === apiKey) {

      //update transaction in firestore
      const transaction = {
        status: 'completed',
      }
      updateDoc(doc(db, 'transactions', id), transaction).then(() => {
        getDoc(doc(db, 'transactions', id)).then((tx) => {
          const txData = tx.data();
          updateDoc(doc(db, 'users', txData.userId), {
            courses: arrayUnion(txData.courseId),
          }).then(() => {
            console.log('User updated');
          }).catch((error) => {
            console.log('Error updating user', error);
          });
        });
      }).catch((error) => {
        console.log('Error updating transaction', error);
      });



      res.status(200).json({ message: 'success' })
    } else {
      res.status(401).json({ message: 'Invalid key' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }


}
