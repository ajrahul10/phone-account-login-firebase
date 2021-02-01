import React, { useState, useEffect } from 'react';
import firebase from '../firebase';
import 'firebase/firestore';
import 'firebase/auth';
import AuthApi from '../AuthApi';
import {fetchUser} from '../DbUtil/FirebaseUtil';

const Dashboard = () => {

    const Auth = React.useContext(AuthApi);
    const [name, setName] = useState('');
    const [recordFetchedSuccessful, setRecordFetchedSuccessful] = useState(false);

    const user = firebase.auth().currentUser;
  
    useEffect(() => {

        checkIfUserAlreadyExists(user);

    }, [])


    // checking if user already exists in firestore using the mobilenum
    async function checkIfUserAlreadyExists(user) {
        const phone = user.phoneNumber;
            const fetchedUser = await fetchUser(phone);
            if(fetchedUser != null) {
                setName(fetchedUser['fullname']);

                // only when record fetch is successful, component will be rendered
                setRecordFetchedSuccessful(true);
            }
    }

    // signing out from the firebase session
    const signOut = () => {
      firebase.auth().signOut().then(() => {
        // setting auth to false to fall back to /login page
        Auth.setAuth(false);
      }).catch((error) => {
        // An error happened.
      });
    }
  
    return (
      <>
        {recordFetchedSuccessful && <div>
            <h1>Welcome to Dashboard: {name}</h1>
            <button onClick={signOut}>Sign Out</button>
        </div>}

      </>
    );
  }

  export default Dashboard;