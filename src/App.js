import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import Calendar from './components/Calendar';
import './App.css';

function App() {
  const [currentUser, setUser] = useState(null);
  const [token, setToken] = useState('');

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (!user) {
        return;
      }
      setUser(user);
    });
    
  }, []);

  const onLogout = () => firebase.auth().signOut()
    .then(function() {
      setUser(null);
    })
    .catch(function(error) {
      // An error happened
    });

  const onClickAuth = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
    firebase.auth().languageCode = 'fr';
    firebase.auth().signInWithPopup(provider).then(function(result) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const token = result.credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      setToken(token);
      setUser(user);
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      const credential = error.credential;
      // ...
      console.error(error);
    });
    
  };
  let content;
  if (!currentUser) {
    content = (
      <button onClick={onClickAuth}>S&apos;authentifier avec Google</button>
    );
  }
  else {
    content = (
      <>
        <nav>
          <button onClick={onLogout}>Déconnexion</button>
        </nav>
        <Calendar />
      </>
    );
  }
  return (
    <div className="App">
      {content}
    </div>
  );
}

export default App;
