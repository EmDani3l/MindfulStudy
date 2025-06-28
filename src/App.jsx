<<<<<<< Updated upstream
import React from 'react';
import StudyForm from './components/StudyForm';

function App() {
  return (
    <div style={{ fontFamily: 'Arial', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#2a9d8f' }}>Mindful Study Scheduler</h2>
      <StudyForm />
=======
import React, { useState, createContext, useContext } from 'react';

function addMinutes(time, mins, day) {
  const [h, m] = time.split(':').map(Number);
  let total = h * 60 + m + mins;
  const newDay = day + Math.floor(total / (24 * 60));
  const newMinutes = total % (24 * 60);
  const nh = Math.floor(newMinutes / 60);
  const nm = newMinutes % 60;
  return {
    time: `${nh < 10 ? '0' : ''}${nh}:${nm < 10 ? '0' : ''}${nm}`,
    day: newDay,
  };
}

function isTimeUsed(time, day, list) {
  return list.some((item) => item.time === time && item.day === day);
}

function addBlocks(start, end, name, list, day) {
  if (!start || !end) return day;
  let current = { time: start, day };
  while (current.time < end || current.day < day) {
    if (!isTimeUsed(current.time, current.day, list)) {
      list.push({ time: current.time, activity: name, day: current.day });
    }
    current = addMinutes(current.time, 60, current.day);
  }
  return current.day;
}

export function generateSchedule({ subjects = [], schoolHours = {}, ccaHours = {} }) {
  let list = [];
  let time = '08:00';
  let day = 1;
  let studied = 0;

  list.push({ time, activity: 'Breakfast', day });
  let next = addMinutes(time, 60, day);
  time = next.time;
  day = next.day;

  day = addBlocks(schoolHours.start, schoolHours.end, 'School', list, day);
  day = addBlocks(ccaHours.start, ccaHours.end, 'CCA', list, day);

  let latestEnd = '08:00';
  if (schoolHours.end && ccaHours.end) {
    latestEnd = schoolHours.end > ccaHours.end ? schoolHours.end : ccaHours.end;
  } else if (schoolHours.end) latestEnd = schoolHours.end;
  else if (ccaHours.end) latestEnd = ccaHours.end;

  if (latestEnd > time) time = latestEnd;

  subjects.forEach((s) => {
    if (s.name.trim() !== '') {
      list.push({ time, activity: `Study: ${s.name}`, day });
      next = addMinutes(time, parseInt(s.duration || 0), day);
      time = next.time;
      day = next.day;
      studied += parseInt(s.duration || 0);

      while (studied >= 60) {
        list.push({ time, activity: 'Break (15 mins)', day });
        next = addMinutes(time, 15, day);
        time = next.time;
        day = next.day;
        studied -= 60;
      }
    }
  });

  list.sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  return list;
}

async function saveCheckIn(entry) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ id: Date.now(), ...entry }), 200);
  });
}

async function loadPrompts() {
  return Promise.resolve([
    'Take a deep breath and relax.',
    'Remember to stretch between study sessions.',
  ]);
}

const TaskContext = createContext();

function TaskProvider({ children }) {
  const [subjects, setSubjects] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tasks, setTasks] = useState([]);

  const createSchedule = (options) => {
    const sched = generateSchedule(options);
    setSchedule(sched);
  };

  const addLog = async (entry) => {
    const saved = await saveCheckIn(entry);
    setLogs((l) => [...l, saved]);
  };

  const addTask = (task) => setTasks((t) => [...t, task]);

  return (
    <TaskContext.Provider
      value={{
        subjects,
        setSubjects,
        schedule,
        createSchedule,
        logs,
        addLog,
        tasks,
        addTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

function StudyForm() {
  const { createSchedule } = useContext(TaskContext);
  const [numSubjects, setNumSubjects] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [schoolStart, setSchoolStart] = useState('');
  const [schoolEnd, setSchoolEnd] = useState('');
  const [ccaStart, setCCAStart] = useState('');
  const [ccaEnd, setCCAEnd] = useState('');

  const handleSubjectCount = (e) => {
    const count = parseInt(e.target.value) || 0;
    setNumSubjects(count);
    setSubjects(new Array(count).fill({ name: '', duration: 60 }));
  };

  const handleSubjectChange = (index, field, value) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const generate = () => {
    createSchedule({
      subjects,
      schoolHours: { start: schoolStart, end: schoolEnd },
      ccaHours: { start: ccaStart, end: ccaEnd },
    });
  };

  const inputStyle = {
    margin: '5px 0',
    padding: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
  };

  return (
    <div>
      <div>
        <label>Number of Subjects:</label>
        <br />
        <input
          type="number"
          value={numSubjects}
          onChange={handleSubjectCount}
          style={inputStyle}
        />
      </div>
      {subjects.map((subj, i) => (
        <div key={i} style={{ marginBottom: '10px' }}>
          <label>Subject {i + 1}:</label>
          <br />
          <input
            type="text"
            value={subj.name}
            onChange={(e) => handleSubjectChange(i, 'name', e.target.value)}
            placeholder="Subject name"
            style={inputStyle}
          />
          <input
            type="number"
            value={subj.duration}
            onChange={(e) => handleSubjectChange(i, 'duration', e.target.value)}
            style={{ ...inputStyle, marginLeft: '5px', width: '80px' }}
          />
          <span style={{ marginLeft: '5px' }}>mins</span>
        </div>
      ))}

      <h3>School</h3>
      <label>Start Time:</label>
      <br />
      <input
        type="time"
        value={schoolStart}
        onChange={(e) => setSchoolStart(e.target.value)}
        style={inputStyle}
      />
      <br />
      <label>End Time:</label>
      <br />
      <input
        type="time"
        value={schoolEnd}
        onChange={(e) => setSchoolEnd(e.target.value)}
        style={inputStyle}
      />

      <h3>CCA</h3>
      <label>Start Time:</label>
      <br />
      <input
        type="time"
        value={ccaStart}
        onChange={(e) => setCCAStart(e.target.value)}
        style={inputStyle}
      />
      <br />
      <label>End Time:</label>
      <br />
      <input
        type="time"
        value={ccaEnd}
        onChange={(e) => setCCAEnd(e.target.value)}
        style={inputStyle}
      />
      <br />
      <br />
      <button onClick={generate}>Generate Schedule</button>
>>>>>>> Stashed changes
    </div>
  );
}

function ScheduleList() {
  const { schedule } = useContext(TaskContext);

  if (!schedule.length) return <p>No schedule generated.</p>;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Your Schedule:</h3>
      <ul>
        {schedule.map((item, i) => (
          <li key={i}>
            Day {item.day} - {item.time} - {item.activity}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TaskForm() {
  const { addTask } = useContext(TaskContext);
  const [name, setName] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !time) return;
    addTask({ name, time });
    setName('');
    setTime('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <h3>Add Reminder</h3>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Task name"
        style={{ padding: '5px', width: '100%', marginBottom: '10px' }}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        style={{ padding: '5px', width: '100%', marginBottom: '10px' }}
      />
      <button type="submit">Add Task</button>
    </form>
  );
}

function TaskList() {
  const { tasks } = useContext(TaskContext);

  if (!tasks.length) return <p>No reminders added.</p>;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Reminders</h3>
      <ul>
        {tasks.map((task, i) => (
          <li key={i}>
            {task.time} - {task.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CheckIn() {
  const { addLog } = useContext(TaskContext);
  const [mood, setMood] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mood.trim() === '') return;
    addLog({ date: new Date().toISOString(), mood });
    setMood('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
      <h3>Mental Health Check-In</h3>
      <input
        type="text"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        placeholder="How are you feeling?"
        style={{ padding: '5px', width: '100%', marginBottom: '10px' }}
      />
      <button type="submit">Log</button>
    </form>
  );
}

function DailyLogList() {
  const { logs } = useContext(TaskContext);

  if (!logs.length) return <p>No check-ins yet.</p>;

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Daily Logs</h3>
      <ul>
        {logs.map((log, i) => (
          <li key={i}>
            {new Date(log.date).toLocaleDateString()} - {log.mood}
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [page, setPage] = useState('plan');

  const renderPage = () => {
    switch (page) {
      case 'plan':
        return (
          <>
            <StudyForm />
            <ScheduleList />
            <TaskForm />
            <TaskList />
          </>
        );
      case 'check':
        return (
          <>
            <CheckIn />
            <DailyLogList />
          </>
        );
      case 'dashboard':
        return (
          <>
            <ScheduleList />
            <TaskList />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <TaskProvider>
      <div style={{ fontFamily: 'Arial', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', color: '#2a9d8f' }}>Mindful Study Scheduler</h2>
        <nav style={{ marginBottom: '20px' }}>
          <button onClick={() => setPage('plan')}>Study Plan</button>
          <button onClick={() => setPage('check')} style={{ marginLeft: '5px' }}>
            Check-Ins
          </button>
          <button onClick={() => setPage('dashboard')} style={{ marginLeft: '5px' }}>
            Dashboard
          </button>
        </nav>
        {renderPage()}
      </div>
    </TaskProvider>
  );
}

export default App;