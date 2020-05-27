import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import classNames from 'classnames';
import Calendar from './components/Calendar';
import './App.css';

function App() {
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
      if (!user) {
        return;
      }
      setUser(user);
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
  const isBooked = (slot) => {
    const selectedDateVal = selectedDate.toISOString().substr(0, 10);
    const bookedSlot = slots.find(({ date, time }) => date === selectedDateVal && time === slot);
    console.log(slot, bookedSlot);
    return !!bookedSlot;
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
  let content;
  if (!currentUser) {
    content = (
      <button onClick={onClickAuth}>S&apos;authentifier avec Google</button>
    );
  }
  else {
    const availableSlots = [
      '09:20', '10:10', '14:10', '15:00', '15:50', '16:40'
    ];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    content = (
      <>
        <nav>
          <button onClick={onLogout}>Déconnexion</button>
        </nav>
        <Calendar
          isDisabled={date => date.getDay() !== 3 || date.getTime() < today.getTime()}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        {
          selectedDate && availableSlots.map(slot => (
            <div
              key={slot}
              className={classNames('Meeting__slot', { 'Meeting__slot--booked': isBooked(slot) })}
              onClick={() => !isBooked(slot) && window.confirm('Réserver ce créneau ?') && confirmSlot(slot)}
            >
              {slot}
            </div>
          ))
        }
        
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
