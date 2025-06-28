import React, { useState, useEffect } from 'react';

const motivationalQuotes = [
  "You’ve got this!",
  "Every small step counts.",
  "Stay consistent, not perfect.",
  "Progress over perfection.",
  "You’re stronger than your excuses.",
  "One page at a time.",
  "Rest is productive too."
];
const relaxationTips = [
  "Close your eyes and take 5 deep breaths.",
  "Stretch your arms and shoulders.",
  "Take a short walk.",
  "Listen to calming music for 5 minutes.",
  "Try box breathing: inhale-4, hold-4, exhale-4, hold-4.",
  "Drink a glass of water and pause.",
  "Write down one thing you’re grateful for."
];
const wellnessTips = [
  "Practice gratitude daily.",
  "Take regular breaks from screens.",
  "Try a 5-minute guided meditation.",
  "Go for a short walk outside.",
  "Talk to a friend about how you feel.",
  "Write down your thoughts in a journal."
];

function App() {
  // Auth
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [authError, setAuthError] = useState("");

  // Navigation
  const [page, setPage] = useState("chat");

  // Study Plan
  const [numSubjects, setNumSubjects] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [studyTime, setStudyTime] = useState(60);
  const [schoolStart, setSchoolStart] = useState('');
  const [schoolEnd, setSchoolEnd] = useState('');
  const [ccaStart, setCCAStart] = useState('');
  const [ccaEnd, setCCAEnd] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [checkIns, setCheckIns] = useState({});
  const [feedback, setFeedback] = useState('');
  const [reminderMsg, setReminderMsg] = useState('');

  // Chatbot
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hi! I'm your MindfulStudy assistant. How can I help you today?" }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Quotes
  const [quote, setQuote] = useState('');
  const [relaxTip, setRelaxTip] = useState('');

  useEffect(() => {
    setQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
    setRelaxTip(relaxationTips[Math.floor(Math.random() * relaxationTips.length)]);
  }, []);

  function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");
    const { username, password } = authForm;
    if (authMode === "login") {
      const user = users.find((u) => u.username === username && u.password === password);
      user ? setCurrentUser(user) : setAuthError("Invalid username or password.");
    } else {
      if (users.some((u) => u.username === username)) {
        setAuthError("Username already exists.");
      } else {
        const newUser = { ...authForm };
        setUsers([...users, newUser]);
        setCurrentUser(newUser);
      }
    }
  }

  function handleSubjectCount(e) {
    const count = parseInt(e.target.value) || 0;
    setNumSubjects(count);
    setSubjects(new Array(count).fill(''));
  }
  function handleSubjectChange(index, value) {
    const updated = [...subjects];
    updated[index] = value;
    setSubjects(updated);
  }

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
    day = addBlocks(ccaStart, ccaEnd, 'Co-curricular Activity', list, day);
    let latestEnd = [schoolEnd, ccaEnd].filter(Boolean).sort().pop() || '08:00';
    if (latestEnd > time) time = latestEnd;

    for (let subject of subjects) {
      if (subject.trim()) {
        list.push({ time, activity: 'Study: ' + subject, day });
        next = addMinutes(time, parseInt(studyTime), day);
        time = next.time;
        day = next.day;
        studied += parseInt(studyTime);
        if (studied >= 60) {
          list.push({ time, activity: 'Break (15 mins)', day });
          next = addMinutes(time, 15, day);
          time = next.time;
          day = next.day;
          studied = 0;
        }
      }
    }

    list.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
    setSchedule(list);
    setCheckIns({});
    setFeedback('');
    setReminderMsg('');
  }

  function handleCheckIn(index) {
    setCheckIns(prev => {
      const updated = { ...prev, [index]: true };
      const completed = Object.keys(updated).length;
      setFeedback(completed === schedule.length ? '🎉 All tasks complete!' :
        completed > 0 ? '✅ Keep going!' : 'Let’s start!');
      return updated;
    });
  }

  useEffect(() => {
    if (!schedule.length) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < schedule.length) {
        setReminderMsg(`⏰ Reminder: ${schedule[i].activity} at ${schedule[i].time}`);
        i++;
      } else {
        setReminderMsg('🎓 All activities complete!');
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [schedule]);

  function handleChatSend(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages(msgs => [...msgs, { sender: "user", text: chatInput }]);
    setTimeout(() => {
      setChatMessages(msgs => [...msgs, { sender: "bot", text: getBotReply(chatInput) }]);
    }, 500);
    setChatInput("");
  }

  function getBotReply(input) {
    const msg = input.toLowerCase();
    if (msg.includes("study plan")) return "Go to the Study Plans tab and fill in your schedule!";
    if (msg.includes("reminder")) return "Reminders are set automatically based on your plan.";
    if (msg.includes("wellness") || msg.includes("stress")) return "Check the Wellness Tips tab!";
    if (msg.includes("exam")) return "Review regularly and take breaks. You got this!";
    if (msg.includes("hello") || msg.includes("hi")) return "Hello! How can I assist you?";
    return "I can help with study plans, wellness tips, and reminders!";
  }

  const inputStyle = {
    width: '100%', margin: '6px 0', padding: '8px', border: '1px solid #ccc', borderRadius: '6px'
  };

  const navBtn = (active) => ({
    color: "#fff",
    background: active ? "#1e88e5" : "transparent",
    border: "none",
    fontWeight: "bold",
    borderRadius: 6,
    padding: "6px 16px",
    cursor: "pointer"
  });

  if (!currentUser) {
    return (
      <div style={{ maxWidth: 400, margin: "80px auto", padding: 24, background: "#fff", borderRadius: 12 }}>
        <h2>{authMode === "login" ? "Login" : "Register"}</h2>
        <form onSubmit={handleAuthSubmit}>
          <input
            placeholder="Username"
            value={authForm.username}
            onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
            style={inputStyle}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={authForm.password}
            onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
            style={inputStyle}
            required
          />
          <button type="submit" style={{ ...inputStyle, background: "#4caf50", color: "#fff" }}>
            {authMode === "login" ? "Login" : "Register"}
          </button>
        </form>
        <div style={{ marginTop: 12 }}>
          {authMode === "login" ? (
            <span>Don't have an account? <button onClick={() => setAuthMode("register")} style={{ color: "#1e88e5", background: "none", border: "none" }}>Register</button></span>
          ) : (
            <span>Already have an account? <button onClick={() => setAuthMode("login")} style={{ color: "#1e88e5", background: "none", border: "none" }}>Login</button></span>
          )}
        </div>
        {authError && <div style={{ color: "red", marginTop: 8 }}>{authError}</div>}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', background: "#f0f4f8", minHeight: "100vh" }}>
      <nav style={{ background: "#3f51b5", padding: 16, display: "flex", gap: 12 }}>
        {["chat", "study", "wellness"].map(tab => (
          <button key={tab} onClick={() => setPage(tab)} style={navBtn(page === tab)}>
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
        <button onClick={() => { setCurrentUser(null); setAuthForm({ username: "", password: "" }); }} style={navBtn(false)}>Logout</button>
      </nav>

      <div style={{ maxWidth: 600, margin: "30px auto", background: "#fff", padding: 24, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ background: '#e3f2fd', borderRadius: 8, padding: 12, marginBottom: 20, borderLeft: '5px solid #42a5f5' }}>
          <div><strong>✨ Quote:</strong> <span style={{ color: '#1e88e5' }}>{quote}</span></div>
          <div><strong>🧘 Tip:</strong> <span style={{ color: '#43a047' }}>{relaxTip}</span></div>
        </div>

        {page === "chat" && (
          <>
            <h2 style={{ color: "#3f51b5" }}>💬 Chat with MindfulStudy</h2>
            <div style={{ height: 200, overflowY: "auto", border: "1px solid #ccc", borderRadius: 8, padding: 10, marginBottom: 10, background: "#f9f9f9" }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ textAlign: msg.sender === "user" ? "right" : "left", margin: "4px 0" }}>
                  <b>{msg.sender === "user" ? "You" : "Bot"}:</b> {msg.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSend} style={{ display: "flex", gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} style={{ flex: 1, padding: 10, borderRadius: 6, border: "1px solid #ccc" }} placeholder="Ask me anything..." />
              <button type="submit" style={{ padding: "10px 20px", background: "#4caf50", color: "#fff", border: "none", borderRadius: 6 }}>Send</button>
            </form>
          </>
        )}

        {page === "study" && (
          <>
            <h2 style={{ color: "#3f51b5" }}>📚 Create Your Study Plan</h2>
            <input type="number" value={numSubjects} onChange={handleSubjectCount} placeholder="Number of Subjects" style={inputStyle} />
            {subjects.map((subj, index) => (
              <input key={index} type="text" value={subj} onChange={e => handleSubjectChange(index, e.target.value)} placeholder={`Subject ${index + 1}`} style={inputStyle} />
            ))}
            <input type="number" value={studyTime} onChange={e => setStudyTime(e.target.value)} placeholder="Study Time (mins)" style={inputStyle} />
            <h3>🏫 School</h3>
            <input type="time" value={schoolStart} onChange={e => setSchoolStart(e.target.value)} style={inputStyle} />
            <input type="time" value={schoolEnd} onChange={e => setSchoolEnd(e.target.value)} style={inputStyle} />
            <h3>🎭 CCA</h3>
            <input type="time" value={ccaStart} onChange={e => setCCAStart(e.target.value)} style={inputStyle} />
            <input type="time" value={ccaEnd} onChange={e => setCCAEnd(e.target.value)} style={inputStyle} />
            <button onClick={generateSchedule} style={{ marginTop: 16, padding: '10px 16px', backgroundColor: '#03a9f4', color: 'white', border: 'none', borderRadius: 6 }}>📅 Generate Schedule</button>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: 20 }}>
              {schedule.map((item, i) => (
                <li key={i} style={{ marginBottom: 8, padding: 8, background: '#f1f8e9', borderRadius: 6 }}>
                  Day {item.day} - {item.time} - {item.activity}
                  <input type="checkbox" checked={!!checkIns[i]} onChange={() => handleCheckIn(i)} style={{ marginLeft: 10 }} />
                </li>
              ))}
            </ul>
            {feedback && <div style={{ marginTop: 10, fontWeight: 'bold', color: '#fb8c00' }}>{feedback}</div>}
            {reminderMsg && <div style={{ marginTop: 10, color: '#6d4c41' }}>{reminderMsg}</div>}
          </>
        )}

        {page === "wellness" && (
          <>
            <h2 style={{ color: "#3f51b5" }}>🌿 Wellness Tips</h2>
            <ul>
              {wellnessTips.map((tip, i) => (
                <li key={i} style={{ marginBottom: 6 }}>💡 {tip}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
