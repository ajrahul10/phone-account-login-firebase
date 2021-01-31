import React from 'react';
import firebase from '../firebase';
import 'firebase/auth';
import AuthApi from '../AuthApi';

const Dashboard = () => {

    const Auth = React.useContext(AuthApi);
    const user = firebase.auth().currentUser;
    const phoneNum = user.phoneNumber;
  
    // useEffect(() => {
    //   console.log(user.uid);
    // }, [])
  
    const signOut = () => {
      firebase.auth().signOut().then(() => {
        console.log("User is signed out");
        console.log(firebase.auth());
        Auth.setAuth(false);
        // Cookies.remove("user");
      }).catch((error) => {
        // An error happened.
      });
    }
  
    return (
      <div>
        <h1>Welcome to Dashboard {phoneNum}</h1>
        <button onClick={signOut}>Sign Out</button>
      </div>
    );
  }

  export default Dashboard;