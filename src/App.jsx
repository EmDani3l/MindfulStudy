import React, { useState, useRef } from 'react';
import Login from './components/Login.jsx';
import ScheduleGenerator from './components/ScheduleGenerator.jsx';
import MoodCheckIn from './components/MoodCheckIn.jsx';
import MindfulnessExercises from './components/MindfulnessExercises.jsx';
import Chatbot from './components/Chatbot.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('jwt'));
  const [page, setPage] = useState('planner');

  // Mock authentication functions
  async function handleLogin(user, pass) {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');

    if (storedUsers[user] && storedUsers[user] === pass) {
      setLoggedIn(true);
      localStorage.setItem('jwt', 'mock-jwt-token');
      localStorage.setItem('currentUser', user);
      return true;
    }
    return false;
  }

  async function handleGoogle() {
    setLoggedIn(true);
    localStorage.setItem('jwt', 'mock-google-jwt-token');
    localStorage.setItem('currentUser', 'google-user@example.com');
  }

  async function handleRegister(user, pass) {
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');

    if (storedUsers[user]) {
      return false; // User already exists
    }

    storedUsers[user] = pass;
    localStorage.setItem('users', JSON.stringify(storedUsers));

    setLoggedIn(true);
    localStorage.setItem('jwt', 'mock-jwt-token');
    localStorage.setItem('currentUser', user);
    return true;
  }

  function handleLogout() {
    setLoggedIn(false);
    localStorage.removeItem('jwt');
    localStorage.removeItem('currentUser');
  }

  const chatbotRef = useRef(null);

  function handleNegativeMood() {
    if (chatbotRef.current) {
      chatbotRef.current.addMessage({
        sender: 'bot',
        text: "I'm really sorry you're feeling that way. I'm here with you. Want to talk more?"
      });
    }
    setPage('chat');
  }

  if (!loggedIn) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} onGoogle={handleGoogle} />;
  }

  return (
    <div style={{ fontFamily: 'Arial', background: '#f4f6f8', minHeight: '100vh' }}>
      <nav style={{ background: '#3f51b5', padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: 20 }}>MindfulStudy</h1>
        {[
          'planner',
          'schedule',
          'checkin',
          'relax',
          'chat'
        ].map(tab => (
          <button
            key={tab}
            onClick={() => setPage(tab)}
            style={{
              background: page === tab ? '#303f9f' : 'transparent',
              border: 'none',
              color: 'white',
              fontWeight: 'bold',
              padding: '6px 12px',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button
          onClick={handleLogout}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontWeight: 'bold',
            padding: '6px 12px',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </nav>

      <div style={{ maxWidth: 600, margin: '20px auto', background: '#fff', padding: 20, borderRadius: 10 }}>
        <ScheduleGenerator page={page} />
        <MoodCheckIn page={page} onNegativeMood={handleNegativeMood} />
        <MindfulnessExercises page={page} />
        <Chatbot ref={chatbotRef} page={page} />
      </div>
    </div>
  );
}

