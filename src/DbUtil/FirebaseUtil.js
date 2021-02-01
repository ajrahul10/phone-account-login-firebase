import firebase from '../firebase';
import { v4 as uuidv4 } from 'uuid';

// Firestore CRUD utility file
export async function fetchUser(phoneNum) {
    const db = firebase.firestore();
    console.log(phoneNum);
    let res = null;

    // checking if user with the mobile number already exists or not
    // referencing it with mmid key from ccfirestore
    await db.collection("ccfirestore").get().then((querySnapshot) => {
        const phoneWithoutPlus = phoneNum.substring(1);
        querySnapshot.forEach((doc) => {
            let mmid = doc.data()['mmid'];
            if(mmid === phoneWithoutPlus) {
                res = doc.data();
            }
            // console.log(doc.data());
        });
    });
    return res;
}

export async function addUser(firstname, middlename, lastname, mmid) {

    const db = firebase.firestore();
    const uuidKey = uuidv4();

    mmid = mmid.substring(1);

    // adding user details to firestore ccmongo collection with doc-id as uuidKey
    db.collection("ccmongo").doc(uuidKey).set({
        frstname: firstname,
        middlename: middlename,
        lastname: lastname,
        fullname: firstname + " " + middlename + " " + lastname,
        mmid: mmid
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });


    // adding user details to firebase ccfirestore collection 
    // refering the same uuidKey from ccmongo over here
    db.collection("ccfirestore").add({
        fullname: firstname + " " + middlename + " " + lastname,
        mmid: mmid,
        mongoid: uuidKey
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
}