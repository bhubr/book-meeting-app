import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import classNames from 'classnames';
import Calendar from './components/Calendar';
import Navbar from './components/Navbar';
import './App.css';

const availableSlots = [
  '09:20', '10:10', '14:10', '15:00', '15:50', '16:40'
];

function App() {
  const [isReady, setIsReady] = useState(false);
  const [currentUser, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const onReceiveSlots = (data) => {
    const value = data.val();
    if (!value) return;
    const nextSlots = Object.values(value).map(({ uid, ...rest }) => rest);
    setSlots(nextSlots);
  };

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        setUser(user);
      }
      setIsReady(true);
    });

    const slotsRef = firebase.database().ref('slots');
    slotsRef.on('value', onReceiveSlots);
    
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
  const numFreeSlots = (date) => {
    const dateVal = date.toISOString().substr(0, 10);
    const bookedSlots = slots.filter(({ date }) => date === dateVal);
    return availableSlots.length - bookedSlots.length;
  };
  const isBooked = (slot) => {
    const selectedDateVal = selectedDate.toISOString().substr(0, 10);
    const bookedSlot = slots.find(({ date, time }) => date === selectedDateVal && time === slot);
    console.log(slot, bookedSlot);
    return !!bookedSlot;
  };
  const isDateDisabled = date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date.getDay() !== 3 || date.getTime() < today.getTime();
  };
  const confirmSlot = (time) => {
    const newSlotKey = firebase.database().ref().child('slots').push().key;
    const slotData = {
      uid: currentUser.uid,
      name: currentUser.displayName,
      date: selectedDate.toISOString().substr(0, 10),
      time,
    };
    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates = {};
    updates['/slots/' + newSlotKey] = slotData;

    return firebase.database().ref().update(updates);
  };
  if (!isReady) {
    return (
      <div className="Login__container">
        <span class="icon-spinner" />
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="Login__container">
        <button className="button is-danger" onClick={onClickAuth}>
          <span class="icon-google" />
          S&apos;authentifier avec Google
        </button>
      </div>
    );
  }
  return (
    <div className="App">
      <Navbar onLogout={onLogout} />
      <div className="columns">
        <div className="column">
          <div className="card">
            <div className="card-content">
              <Calendar
                isDisabled={isDateDisabled}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                renderDay={
                  (date) => (
                    <span className="Calendar__day">
                      {
                        !isDateDisabled(date) && numFreeSlots(date) > 0 && <span class="badge">{numFreeSlots(date)}</span>
                      }
                      {date.getDate()}
                    </span>
                  )
                }
              />
            </div>
          </div>
        </div>
        <div className="column">
          {
            selectedDate
            ? availableSlots.map(slot => (
              <div
                key={slot}
                className={classNames('Meeting__slot', 'card', { 'Meeting__slot--booked': isBooked(slot) })}
                onClick={() => !isBooked(slot) && window.confirm('Réserver ce créneau ?') && confirmSlot(slot)}
              >
                <div className="card-content Meeting__slot__content">{slot}</div>
              </div>
            ))
            : (
              <div className="card">
                <div className="card-content">
                  Veuillez choisir une date dans le calendrier <span role="img">😊</span>
                </div>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default App;
