import React, { useRef, useState} from 'react';
import firebase from '../firebase';
import 'firebase/auth'
import AuthApi from '../AuthApi';

const Login = () => {

    const Auth = React.useContext(AuthApi);
    const phoneValue = useRef();
    const otpValue = useRef();
    const [otpVisible, setOtpVisible] = useState(false);
    const [someError, setSomeError] = useState('');
    const [msg, setMsg] = useState('');
    const [recaptcha1, setUpRecapta1] = useState(false);
  
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
  
    const onSignInSubmit = (event) => {
      event.preventDefault();
      setSomeError('');
      setMsg('');
      console.log(firebase.auth());
      if(recaptcha1 == false)
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
        setMsg('');
        setSomeError('Incorrect OTP. Resend verification code');
        setOtpVisible(false);
        // User couldn't sign in (bad verification code?)
        // ...
      });
    }
  
    return (

    <>
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
        <div style={{color:'green'}}>{msg}</div>
        <div id="recaptcha-container"></div>
      </div>
    </>
    );
  }

  export default Login;