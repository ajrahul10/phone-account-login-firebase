import firebase from 'firebase/app';

// add firebase sdk over here
const firebaseConfig = {
    apiKey: "..add apiKey here..",
    authDomain: "..add authDomain here..",
    databaseURL: "..add databaseURL here..",
    projectId: "..add projectId here..",
    storageBucket: "..add storageBucket here..",
    messagingSenderId: "..add messagingSenderId here..",
    appId: "..add appId here.."
  };

firebase.initializeApp(firebaseConfig);

export default firebase;