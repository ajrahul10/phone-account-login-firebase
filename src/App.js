import React, {useEffect} from 'react';
import firebase from './firebase';
import 'firebase/auth'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom";
import AuthApi from './AuthApi';
import Login from './Login/Login'
import Dashboard from './Dashboard/Dashboard'
import {fetchUser} from './DbUtil/FirebaseUtil';

function App() {

  const [auth, setAuth] = React.useState(false);
  const [authIsResolved, setAuthIsResolved] = React.useState(false);
  const [loggedInUser, setLoggedInUser] = React.useState(null);


  useEffect(() => {


    // this firebase method checks if user is signed in or not
    // by checking the broser storage
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        console.log("User state changed: signed in");
        checkIfUserAlreadyExists(user);
      } else {
        // No user is signed in.
        console.log("User state changed: signed out");
        setAuth(false);
        setAuthIsResolved(true);
      }
    });
  }, [])

  // checking is auth already exists by referencing phonenum from firestore
  async function checkIfUserAlreadyExists(user) {
    const phone = user.phoneNumber;
        const fetchedUser = await fetchUser(phone);
        if(fetchedUser != null) {
            console.log("User already exists");
            setLoggedInUser(fetchedUser);

            // setting auth to true to redirect to /dashboard
            setAuth(true);
        }
        setAuthIsResolved(true);
  }

  // only when auth is checked after checking from firestore
  // content is displayed
  // if auth exists , redirect to dashboard
  // else to login page
  return authIsResolved ? (
    <div>
      <AuthApi.Provider value={{auth, setAuth, loggedInUser}}>
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

const Routes = () => {
  const Auth = React.useContext(AuthApi);
  return (

    // router for react inside switch
    // for main path '/' , redirecting to dashboard if auth exists and login if doesn't 
    <Switch>
      <ProtectedRoute exact path="/" auth={Auth.auth} component={Dashboard} />
      <ProtectedLogin path="/login" component={Login} auth={Auth.auth} />
      <ProtectedRoute path="/dashboard" auth={Auth.auth} component={Dashboard} />
    </Switch>
  );
}

// created to redirecting to /login if auth don't exists
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


// created to redirecting to /dashboard if auth already exists
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
