import React from 'react';
import ReactDOM from 'react-dom';
import firebase from 'firebase';
import 'bulma/css/bulma.min.css';
import '@creativebulma/bulma-badge/dist/bulma-badge.min.css';
import App from './App';
import firebaseConfig from './firebase-config';
import * as serviceWorker from './serviceWorker';

firebase.initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
