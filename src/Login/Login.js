import React, { useRef, useState, useEffect} from 'react';
import firebase from '../firebase';
import 'firebase/auth'
import AuthApi from '../AuthApi';
import {fetchUser, addUser} from '../DbUtil/FirebaseUtil';

const Login = () => {

    const Auth = React.useContext(AuthApi);
    const phoneValue = useRef();
    const otpValue = useRef();
    const [otpVisible, setOtpVisible] = useState(false);
    const [someError, setSomeError] = useState('');
    const [msg, setMsg] = useState('');
    const [recaptcha1, setUpRecapta1] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState(null);

    const user = firebase.auth().currentUser;
    const loggedInUserRecord = Auth.loggedInUser;
    const [userRecordExisting, setUserRecordExisting] = useState(null);

    const firstname = useRef();
    const middlename = useRef();
    const lastname = useRef();

    
    useEffect(() => {

        // checking if user already exists or not
        if(user != null) {
            setPhoneNumber(user.phoneNumber);
            checkExistingUser(user.phoneNumber);
        }

    }, [])

    // checking existing user record from firebase
    const checkExistingUser = (phoneNumber) => {
        if(phoneNumber != null) {

            if(loggedInUserRecord != null) {
                console.log("User state changed: signed in");

                // user record found, setting auth to true for redirecting to /dashboard
                Auth.setAuth(true);
            } else {
                
                // as record doesn't exist, we are signing out 
                // so login is displayed and not signup on refresh
                firebase.auth().signOut().then(() => {
                    console.log("User is signed out");
                    Auth.setAuth(false);
                  }).catch((error) => {
                    // An error happened.
                  });
            }
        }
    }

    // checking if user already exist
    // as opposed to above method, this is only only called 
    // after successfull otp submittion
    async function checkIfUserAlreadyExists(user) {
        const phone = user.phoneNumber;
            const fetchedUser = await fetchUser(phone);
            if(fetchedUser != null) {
                console.log("User already exists");
                Auth.setAuth(true);
            } else {
                setUserRecordExisting(false);
            }
      }
  
      // function for setting up captcha
    const setUpRecapta = (event) => {
      window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          console.log("Captcha Resolved");
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          setUpRecapta1(true);
          onSignInSubmit();
        }
      });
    }
  
    // method called when requesting for otp
    const onSignInSubmit = (event) => {
      event.preventDefault();
      setSomeError('');
      setMsg('');
      if(recaptcha1 === false)
        setUpRecapta();

        // fetching phone number from the field
      const phoneNumber = "+91" + phoneValue.current.value;
      setPhoneNumber(phoneNumber);
      const appVerifier = window.recaptchaVerifier;
      firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
          .then((confirmationResult) => {
            // SMS sent. Prompt user to type the code from the message, then sign the
            // user in with confirmationResult.confirm(code).
            window.confirmationResult = confirmationResult;
            setOtpVisible(true);
            setMsg('OTP is sent');
            // ...
          }).catch((error) => {
            // Error; SMS not sent
            setSomeError('Error; SMS not sent. Resend verification code');
            window.recaptchaVerifier.render().then(function(widgetId) {
                window.grecaptcha.reset(widgetId);
            });
            // ...
          });
    }
  
    // method called when otp is submitted
    const onOtpSubmit = () => {
      const code = otpValue.current.value;
      window.confirmationResult.confirm(code).then((result) => {
        // User signed in successfully.
        const user = result.user;
        console.log("User is signed in");
        console.log(firebase.auth());

        // calling this method, if success redirect to /dashboard
        checkIfUserAlreadyExists(user);
      }).catch((error) => {
        setMsg('');
        setSomeError('Incorrect OTP. Resend verification code');
        setOtpVisible(false);
        // User couldn't sign in (bad verification code?)
      });
    }

    const handleSignUp = () => {
        const fname = firstname.current.value;
        const mname = middlename.current.value;
        const lname = lastname.current.value;

        addUser(fname, mname, lname, phoneNumber)
        .then(function(docRef) {

            // once user is added to firestore, set auth to true
            // for redirecting it to /dashboard
            Auth.setAuth(true);
        })
        .catch(function(error) {
            console.error("Error adding document: ", error);
        });
    }

    const SignUp = () => {
        return (
            <>
                <div>
                    <h2>Hello {phoneNumber}</h2>
                    <h3>Provide your details to continue to dashboard</h3>
                    First name: <input ref={firstname} type="input" /><br/>
                    Middle name: <input ref={middlename} type="input" /><br/>
                    Last name: <input ref={lastname} type="input" /><br/>
                    <button onClick={handleSignUp}>Sign Up</button>
                </div>
            </>
        );
    }

    const LoggedIn = () => {
        return(
            <div>
                <h1>Login Page</h1>
                <div id="phone-login">
                Enter phone number: +91-<input ref={phoneValue} type="text" defaultValue="9987654321" />
                <button onClick={onSignInSubmit}>Send OTP</button>
                </div>
                <br/><br/>
                { otpVisible && 
                <div id="otp-login">
                    Enter OTP: <input ref={otpValue} type="text" defaultValue="987654" />
                    <button onClick={onOtpSubmit}>Login</button>
                </div>
                }
                <br/>
                <div style={{color:'red'}}>{someError}</div>
                <div style={{color:'green'}}>{msg}</div>
                <div id="recaptcha-container"></div>
            </div>
        );
    }
  
    // based on if user record exists, displaying loggin page or signup
    return userRecordExisting == null ? (<LoggedIn />) : (<SignUp />)
  }

  export default Login;