import firebase from '../firebase';

// Firestore CRUD utility file
export async function fetchUser(phoneNum) {
    const db = firebase.firestore();
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
        });
    });
    return res;
}

export async function addUser(firstname, middlename, lastname, mmid) {

    const db = firebase.firestore();

    mmid = mmid.substring(1);

    // adding user details to firestore ccmongo collection with doc-id as uuidKey
    const {id} = await db.collection("ccmongo").add({
        frstname: firstname,
        middlename: middlename,
        lastname: lastname,
        fullname: firstname + " " + middlename + " " + lastname,
        mmid: mmid
    })


    // adding user details to firebase ccfirestore collection 
    // refering the same doc-id from ccmongo over here
    const {id1} = await db.collection("ccfirestore").add({
        fullname: firstname + " " + middlename + " " + lastname,
        mmid: mmid,
        mongoid: id
    })

}