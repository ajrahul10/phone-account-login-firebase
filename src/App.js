import React, {useEffect, useRef, useState} from 'react';
import firebase from './firebase';
import 'firebase/auth'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import AuthApi from './AuthApi';
// import Cookies from 'js-cookie';

function App() {

  const [auth, setAuth] = React.useState(false);
  const [authIsResolved, setAuthIsResolved] = React.useState(false);

  // const readCookie = () => {
  //   const user = Cookies.get("user");
  //   if(user) {
  //     setAuth(true);
  //   }
  // }

  useEffect(() => {

    // readCookie();

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        console.log("User state changed: signed in");
        setAuth(true);
      } else {
        // No user is signed in.
        console.log("User state changed: signed out");
        setAuth(false);
      }
      setAuthIsResolved(true);
    });
  }, [])

  return authIsResolved ? (
    <div>
      <AuthApi.Provider value={{auth, setAuth}}>
        <Router>
          <Routes />
        </Router>
      </AuthApi.Provider>
    </div>
  ):(
    <>
      Loading...
    </>
  );
}

const Login = () => {

  const Auth = React.useContext(AuthApi);
  const phoneValue = useRef();
  const otpValue = useRef();
  const [otpVisible, setOtpVisible] = useState(false);
  const [someError, setSomeError] = useState('');

  const setUpRecapta = () => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
      'callback': (response) => {
        console.log("Captcha Resolved");
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        onSignInSubmit();
      }
    });
  }

  const onSignInSubmit = (event) => {
    event.preventDefault();
    setSomeError('');
    console.log(firebase.auth());
    setUpRecapta();
    const phoneNumber = "+91" + phoneValue.current.value;
    console.log(phoneNumber);
    const appVerifier = window.recaptchaVerifier;
    firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier)
        .then((confirmationResult) => {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          window.confirmationResult = confirmationResult;
          setOtpVisible(true);
          // ...
        }).catch((error) => {
          // Error; SMS not sent
          setSomeError('Error; SMS not sent');
          // ...
        });
  }

  const onOtpSubmit = () => {
    const code = otpValue.current.value;
    window.confirmationResult.confirm(code).then((result) => {
      // User signed in successfully.
      // const user = result.user;
      console.log("User is signed in");
      console.log(firebase.auth());
      Auth.setAuth(true);
      // Cookies.set("user", "loginTrue");
      // ...
    }).catch((error) => {
      setSomeError('User couldn\'t sign in (bad verification code?)');
      // User couldn't sign in (bad verification code?)
      // ...
    });
  }

  return (
    <div>
      <h1>Login Page</h1>
      <div id="phone-login">
        Enter phone number: +91-<input ref={phoneValue} type="text" defaultValue="1234567899" />
        <button onClick={onSignInSubmit}>Send OTP</button>
      </div>
      <br/><br/>
      { otpVisible && 
        <div id="otp-login">
          Enter OTP: <input ref={otpValue} type="text" defaultValue="123456" />
          <button onClick={onOtpSubmit}>Login</button>
        </div>
      }
      <br/>
      <div style={{color:'red'}}>{someError}</div>
      <div id="recaptcha-container"></div>
    </div>
  );
}

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

const Routes = () => {
  const Auth = React.useContext(AuthApi);
  return (
    <Switch>
      <ProtectedRoute exact path="/" auth={Auth.auth} component={Dashboard} />
      <ProtectedLogin path="/login" component={Login} auth={Auth.auth} />
      <ProtectedRoute path="/dashboard" auth={Auth.auth} component={Dashboard} />
    </Switch>
  );
}

const ProtectedRoute = ({auth, component:Component}) => {
  return (
    <Route
      render = {() => auth? (
        <Component />
      ):
      (
        <Redirect to="/login" />
      )
    }
    />
  );
}

const ProtectedLogin = ({auth, component:Component}) => {
  return (
    <Route
      render = {() => !auth? (
        <Component />
      ):
      (
        <Redirect to="/dashboard" />
      )
    }
    />
  );
}

export default App;
