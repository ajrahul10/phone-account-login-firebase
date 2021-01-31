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
