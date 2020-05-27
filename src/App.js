import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import classNames from 'classnames';
import Calendar from './components/Calendar';
import Navbar from './components/Navbar';
import ChooseDateParagraph from './components/ChooseDateParagraph';
import './App.css';

const availableSlots = [
  '09:20', '10:10', '14:10', '15:00', '15:50', '16:40'
];

function App() {
  const [isReady, setIsReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const onReceiveSlots = (data) => {
    const value = data.val();
    if (!value) return;
    const nextSlots = Object.values(value);
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

  useEffect(() => {
    if (currentUser) {
      const userRef = firebase.database().ref(`users/${currentUser.uid}`);
      userRef.on('value', (data) => {
        const value = data.val();
        if (!value) return;
        const { admin } = JSON.parse(value);
        if (admin) setIsAdmin(true);
      });
    }
  }, [currentUser]);

  const onLogout = () => firebase.auth().signOut()
    .then(function() {
      setUser(null);
    })
    .catch(function(error) {
      alert(error.message);
    });

  const onClickAuth = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().languageCode = 'fr';
    firebase.auth().signInWithPopup(provider).then(function(result) {
      const token = result.credential.accessToken;
      const user = result.user;
      setToken(token);
      setUser(user);
    }).catch(function(error) {
      alert(error.message);
    });
    
  };
  const numFreeSlots = (date) => {
    const dateVal = date.toISOString().substr(0, 10);
    const bookedSlots = slots.filter(({ date }) => date === dateVal);
    return availableSlots.length - bookedSlots.length;
  };
  const getBookedSlot = (slot) => {
    const selectedDateVal = selectedDate.toISOString().substr(0, 10);
    return slots.find(({ date, time }) => date === selectedDateVal && time === slot);
  };
  const isDateDisabled = date => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date.getDay() !== 3 || date.getTime() < today.getTime();
  };
  const confirmSlot = (time) => {
    const newSlotKey = firebase.database().ref().child('slots').push().key;
    const { uid, email, displayName: name } = currentUser;
    const date = selectedDate.toISOString().substr(0, 10);
    const slotData = {
      uid, name, email, date, time,
    };
    // Write the new post's data simultaneously in the posts list and the user's post list.
    const updates = {};
    updates['/slots/' + newSlotKey] = slotData;

    return firebase.database().ref().update(updates);
  };
  const onBookSlot = (slot, bookedSlot) => {
    // Don't allow to book if already booked
    if (bookedSlot) return;
    // Look up booked slots for current user
    const dateVal = selectedDate.toISOString().substr(0, 10);
    const bookedSlots = slots.filter(
      ({ uid, date }) => (uid === currentUser.uid && date === dateVal)
    );
    if (bookedSlots.length) {
      alert('Vous avez déjà réservé un créneau pour ce jour !');
      return;
    }
    if (window.confirm('Réserver ce créneau ?')) {
      confirmSlot(slot);
    }
  };
  if (!isReady) {
    return (
      <div className="Login__container">
        <span className="icon-spinner" />
      </div>
    );
  }
  if (!currentUser) {
    return (
      <div className="Login__container">
        <button className="button is-danger" onClick={onClickAuth}>
          <span className="icon-google" />
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
                        !isDateDisabled(date) && numFreeSlots(date) > 0 && <span className="badge">{numFreeSlots(date)}</span>
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
            ? availableSlots.map(time => {
              const bookedSlot = getBookedSlot(time);
              const isBookedByMe = bookedSlot && bookedSlot.uid === currentUser.uid;
              const innerContent = bookedSlot
                ? (
                  <span>
                    <span
                      className={classNames({ 'Meeting__slot--booked': !isBookedByMe, 'Meeting__slot--isMine': isBookedByMe })}
                    >{bookedSlot.time}</span>
                    {' '}
                    {
                      isAdmin && <a href={`mailto:${bookedSlot.email}`}>{bookedSlot.name}</a>
                    }
                  </span>
                )
                : time;
              return (
                <div
                  key={time}
                  className={classNames('Meeting__slot', 'card')}
                  onClick={() => onBookSlot(time, bookedSlot)}
                >
                  <div className="card-content Meeting__slot__content">{innerContent}</div>
                </div>
              );
            })
            : <ChooseDateParagraph />
          }
        </div>
      </div>
    </div>
  );
}

export default App;
