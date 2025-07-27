import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Login.jsx';
import axios from 'axios';

// Time utilities
function addMinutes(time, mins, day) {
  const [h, m] = time.split(':').map(Number);
  let total = h * 60 + m + mins;
  let newDay = day + Math.floor(total / (24 * 60));
  let newMinutes = total % (24 * 60);
  let nh = Math.floor(newMinutes / 60);
  let nm = newMinutes % 60;
  return {
    time: `${nh < 10 ? '0' : ''}${nh}:${nm < 10 ? '0' : ''}${nm}`,
    day: newDay
  };
}

function isTimeUsed(time, day, list) {
  return list.some(item => item.time === time && item.day === day);
}

function addBlocks(start, end, name, list, day) {
  if (!start || !end) return day;
  let time = start;
  let current = { time, day };
  while (current.time < end && current.day === day) {
    if (!isTimeUsed(current.time, current.day, list)) {
      list.push({ time: current.time, activity: name, day: current.day });
    }
    current = addMinutes(current.time, 60, current.day);
  }
  return current.day;
}

export default function App() {
  // state/hooks
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem('jwt'));
  const [page, setPage] = useState('planner');
  const [numSubjects, setNumSubjects] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [studyTime, setStudyTime] = useState(60);
  const [schoolStart, setSchoolStart] = useState('');
  const [schoolEnd, setSchoolEnd] = useState('');
  const [hasCCA, setHasCCA] = useState(false);
  const [ccaStart, setCCAStart] = useState('');
  const [ccaEnd, setCCAEnd] = useState('');
  const [schedule, setSchedule] = useState([]);

  const [mood, setMood] = useState('');
  const [moodReason, setMoodReason] = useState('');
  const [logs, setLogs] = useState([]);

  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: "Hi! I'm here for you. What's on your mind?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatRef = useRef(null);

  // relax states
  const [favorites, setFavorites] = useState([]);
  const [modalConfig, setModalConfig] = useState({ visible: false, type: '', tip: '' });
  const relaxationTips = [
    'Take 5 deep breaths',
    'Stretch your arms and legs',
    'Drink water slowly',
    "Write something you're grateful for",
    'Play soft background music',
    'Step outside for 2 minutes'
  ];

  // Mock authentication functions
  async function handleLogin(user, pass) {
    // Mock authentication - check if user exists in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (storedUsers[user] && storedUsers[user] === pass) {
      setLoggedIn(true);
      localStorage.setItem('jwt', 'mock-jwt-token');
      localStorage.setItem('currentUser', user);
      return true;
    }
    return false;
  }

  async function handleGoogle(token) {
    // Mock Google authentication
    setLoggedIn(true);
    localStorage.setItem('jwt', 'mock-google-jwt-token');
    localStorage.setItem('currentUser', 'google-user@example.com');
  }

  async function handleRegister(user, pass) {
    // Mock registration - store user in localStorage
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    
    if (storedUsers[user]) {
      return false; // User already exists
    }
    
    storedUsers[user] = pass;
    localStorage.setItem('users', JSON.stringify(storedUsers));
    
    // Auto-login after registration
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

  // effects
  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const alerts = subjects.filter(s => s.deadline).filter(s => {
        const due = new Date(s.deadline);
        return due >= now && due <= tomorrow;
      });
      if (alerts.length > 0) {
        alert(
          '📌 Upcoming Deadline:\n' +
            alerts.map(s => `• ${s.name} - due by ${s.deadline}`).join('\n')
        );
      }
    };
    checkDeadlines();
    const iv = setInterval(checkDeadlines, 24 * 60 * 60 * 1000);
    return () => clearInterval(iv);
  }, [subjects]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // chat handlers
  async function getBotReply(input) {
  try {
    const res = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: "You're a caring study and mental health companion." },
          { role: 'user', content: input }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
        }
      }
    );
    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('ChatGPT error', err);
    return "Sorry, I'm having trouble responding right now.";
  }
}

  async function handleChatSend(e) {
  e.preventDefault();
  if (!chatInput.trim()) return;

  // add the user's message
  setChatMessages(ms => [...ms, { sender: 'user', text: chatInput }]);
  setChatInput('');
  setTyping(true);

  // fetch the AI's reply
  const reply = await getBotReply(chatInput);

  // display the AI's message
  setTyping(false);
  setChatMessages(ms => [...ms, { sender: 'bot', text: reply }]);
}

  // schedule generation
  function generateSchedule() {
    let list = [];
    let time = '08:00';
    let day = 1;
    let studied = 0;
    list.push({ time, activity: 'Breakfast', day });
    let next = addMinutes(time, 60, day);
    time = next.time;
    day = next.day;
    day = addBlocks(schoolStart, schoolEnd, 'School', list, day);
    if (hasCCA && ccaStart && ccaEnd) day = addBlocks(ccaStart, ccaEnd, 'CCA', list, day);
    const latestEnd = [schoolEnd, hasCCA ? ccaEnd : null].filter(Boolean).sort().pop() || '08:00';
    if (latestEnd > time) time = latestEnd;
    for (let s of subjects) {
      if (s.name.trim()) {
        list.push({ time, activity: `Study: ${s.name}`, day });
        next = addMinutes(time, parseInt(studyTime), day);
        time = next.time;
        day = next.day;
        studied += parseInt(studyTime);
        if (studied >= 60) {
          list.push({ time, activity: 'Relaxation Break (15 mins)', day });
          next = addMinutes(time, 15, day);
          time = next.time;
          day = next.day;
          studied = 0;
        }
      }
    }
    list.push({ time, activity: 'Free Time / Chill', day });
    list.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
    setSchedule(list);
  }

  // mood handler
  function handleMoodSubmit(e) {
    e.preventDefault();
    if (!mood) return;
    const txt = (mood + ' ' + moodReason).toLowerCase();
    const negWords = ['sad','stress','depress','anxious','angry','tired','cry','panic','burnt out','overwhelmed','hopeless','worthless'];
    const isNeg = negWords.some(w => txt.includes(w));
    setLogs(ls => [...ls, { mood, moodReason, time: new Date().toLocaleString() }]);
    if (isNeg) {
      setChatMessages(ms => [...ms, { sender: 'bot', text: "I'm really sorry you're feeling that way. I'm here with you. Want to talk more?" }]);
      setPage('chat');
    }
    setMood('');
    setMoodReason('');
  }

  // relax handlers
  function toggleFavorite(tip) {
    setFavorites(f => f.includes(tip) ? f.filter(x => x !== tip) : [...f, tip]);
  }

  function surpriseMe() {
    const pool = relaxationTips.filter(t => !favorites.includes(t));
    const all = pool.length ? pool : relaxationTips;
    handleTipClick(all[Math.floor(Math.random() * all.length)]);
  }

  function handleTipClick(tip) {
    if (tip === 'Take 5 deep breaths') setModalConfig({ visible: true, type: 'breathing', tip });
    else if (tip === "Write something you're grateful for") setModalConfig({ visible: true, type: 'gratitude', tip });
    else setModalConfig({ visible: true, type: 'generic', tip });
  }

  if (!loggedIn) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} onGoogle={handleGoogle} />;
  }

  return (
    <div style={{ fontFamily: 'Arial', background: '#f4f6f8', minHeight: '100vh' }}>
      <nav style={{ background: '#3f51b5', padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
        <h1 style={{ color: 'white', margin: 0, fontSize: 20 }}>🧘 MindfulStudy</h1>
        {['planner','schedule','checkin','relax','chat'].map(tab => (
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

        {/* PLANNER */}
        {page === 'planner' && (
          <>
            <h2>Study Planner</h2>

            <label>Number of Subjects</label>
            <input
              type="number"
              value={numSubjects}
              onChange={e => {
                const n = parseInt(e.target.value) || 0;
                setNumSubjects(n);
                setSubjects(new Array(n).fill({ name: '', deadline: '' }));
              }}
              style={{ width: '100%', marginBottom: 8 }}
            />

            {subjects.map((s, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <label>Subject {i + 1} Name</label>
                <input
                  value={s.name}
                  onChange={e => {
                    const updated = [...subjects];
                    updated[i] = { ...updated[i], name: e.target.value };
                    setSubjects(updated);
                  }}
                  style={{ width: '100%', marginBottom: 4 }}
                />
                <label>Subject {i + 1} Deadline</label>
                <input
                  type="date"
                  value={s.deadline}
                  onChange={e => {
                    const updated = [...subjects];
                    updated[i] = { ...updated[i], deadline: e.target.value };
                    setSubjects(updated);
                  }}
                  style={{ width: '100%' }}
                />
              </div>
            ))}

            <label>Study Time per Subject (mins)</label>
            <input
              type="number"
              value={studyTime}
              onChange={e => setStudyTime(parseInt(e.target.value))}
              style={{ width: '100%', marginBottom: 8 }}
            />

            <label>School Start Time</label>
            <input
              type="time"
              value={schoolStart}
              onChange={e => setSchoolStart(e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
            />

            <label>School End Time</label>
            <input
              type="time"
              value={schoolEnd}
              onChange={e => setSchoolEnd(e.target.value)}
              style={{ width: '100%', marginBottom: 8 }}
            />

            <label style={{ display: 'block', margin: '16px 0 8px' }}>
              <input
                type="checkbox"
                checked={hasCCA}
                onChange={e => setHasCCA(e.target.checked)}
              />{' '}
              I have CCA
            </label>

            {hasCCA && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 4 }}>CCA Start Time</label>
                <input
                  type="time"
                  value={ccaStart}
                  onChange={e => setCCAStart(e.target.value)}
                  style={{ width: '100%', marginBottom: 12 }}
                />

                <label style={{ display: 'block', marginBottom: 4 }}>CCA End Time</label>
                <input
                  type="time"
                  value={ccaEnd}
                  onChange={e => setCCAEnd(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button
                onClick={generateSchedule}
                style={{
                  background: '#2196f3',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Generate Schedule
              </button>
            </div>
          </>
        )}

        {/* SCHEDULE */}
        {page === 'schedule' && (
          <>
            <h2>Your Schedule</h2>
            {schedule.length === 0 ? (
              <p>No schedule generated.</p>
            ) : (
              <ul>
                {schedule.map((item, i) => (
                  <li key={i}>
                    Day {item.day} - {item.time} - {item.activity}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {page === 'checkin' && (
          <>
            <h2>Mood Check‑In</h2>
            <form onSubmit={handleMoodSubmit}>
              <label>How do you feel?</label>
              <input
                type="text"
                value={mood}
                onChange={e => setMood(e.target.value)}
                style={{ width: '100%', marginBottom: 8 }}
              />
              <label>Why do you feel this way?</label>
              <textarea
                value={moodReason}
                onChange={e => setMoodReason(e.target.value)}
                style={{ width: '100%', marginBottom: 8 }}
              />
              <button
                type="submit"
                style={{ background: '#ff9800', color: 'white', padding: 10, border: 'none', borderRadius: 6 }}
              >
                Submit
              </button>
            </form>
            <ul>
              {logs.map((log, i) => (
                <li key={i}>
                  {log.time} — {log.mood} ({log.moodReason})
                </li>
              ))}
            </ul>
          </>
        )}

        {page === 'chat' && (
          <>
            <h2>Chat</h2>
            <div
              ref={chatRef}
              style={{ maxHeight: 300, overflowY: 'auto', background: '#eee', padding: 10, borderRadius: 8 }}
            >
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                    marginBottom: 6
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      background: msg.sender === 'user' ? '#4caf50' : '#e0e0e0',
                      color: msg.sender === 'user' ? '#fff' : '#000',
                      padding: '8px 12px',
                      borderRadius: 16
                    }}
                  >
                    {msg.text}
                  </span>
                </div>
              ))}
              {typing && <i>Bot is typing...</i>}
            </div>
            <form onSubmit={handleChatSend} style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Talk to me..."
                style={{ flex: 1, padding: 10, borderRadius: 6, border: '1px solid #ccc' }}
              />
              <button
                type="submit"
                style={{ padding: '10px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: 6 }}
              >
                Send
              </button>
            </form>
          </>
        )}

        {page === 'relax' && (
          <>
            <h2>Relaxation Tips</h2>
            <button
              onClick={surpriseMe}
              style={{
                marginBottom: 12,
                padding: '8px 12px',
                border: 'none',
                borderRadius: 6,
                background: '#ffeb3b',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Surprise Me 🎲
            </button>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {[...favorites, ...relaxationTips.filter(t => !favorites.includes(t))].map(tip => (
                <li
                  key={tip}
                  onClick={() => handleTipClick(tip)}
                  style={{
                    background: '#e3f2fd',
                    margin: '8px 0',
                    padding: '12px 16px',
                    borderRadius: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'transform .1s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span>🧘 {tip}</span>
                  <span
                    onClick={e => { e.stopPropagation(); toggleFavorite(tip); }}
                    style={{ cursor: 'pointer', fontSize: 18 }}
                  >
                    {favorites.includes(tip) ? '★' : '☆'}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Modals */}
      {modalConfig.visible && (
        <Modal onClose={() => setModalConfig({ visible: false, type: '', tip: '' })}>
          {modalConfig.type === 'breathing' && <BreathingModal onDone={() => setModalConfig({ visible: false })} />}
          {modalConfig.type === 'gratitude' && <GratitudeModal onDone={() => setModalConfig({ visible: false })} />}
          {modalConfig.type === 'generic' && (
            <div style={{ padding: 20 }}>
              <p>{modalConfig.tip}</p>
              <button onClick={() => setModalConfig({ visible: false, type: '', tip: '' })}>Close</button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// Helper components
function Modal({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 8, padding: 20, maxWidth: 300, width: '100%' }}
      >
        {children}
      </div>
    </div>
  );
}

function BreathingModal({ onDone }) {
  const [count, setCount] = useState(5);
  const [inhale, setInhale] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      if (count === 0) {
        clearInterval(iv);
        onDone();
      } else {
        setInhale(i => !i);
        if (!inhale) setCount(c => c - 1);
      }
    }, 4000);
    return () => clearInterval(iv);
  }, [count, inhale, onDone]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>{inhale ? 'Inhale…' : 'Exhale…'}</h3>
      <div
        style={{
          margin: '20px auto',
          width: inhale ? 150 : 80,
          height: inhale ? 150 : 80,
          borderRadius: '50%',
          background: '#90caf9',
          transition: 'all 3.5s ease-in-out'
        }}
      />
      <p>Breaths left: {count}</p>
    </div>
  );
}

function GratitudeModal({ onDone }) {
  const [text, setText] = useState('');

  function save() {
    if (text.trim()) alert(`You wrote: "${text.trim()}"`);
    onDone();
  }

  return (
    <div>
      <h3>What are you grateful for?</h3>
      <textarea
        rows={4}
        style={{ width: '100%', marginBottom: 10 }}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={save} style={{ marginRight: 8 }}>Save</button>
      <button onClick={onDone}>Cancel</button>
    </div>
  );
}
