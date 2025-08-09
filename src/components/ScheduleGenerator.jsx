import React, { useState, useEffect } from 'react';

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

export default function ScheduleGenerator({ page }) {
  const [numSubjects, setNumSubjects] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [studyTime, setStudyTime] = useState(60);
  const [schoolStart, setSchoolStart] = useState('');
  const [schoolEnd, setSchoolEnd] = useState('');
  const [hasCCA, setHasCCA] = useState(false);
  const [ccaStart, setCCAStart] = useState('');
  const [ccaEnd, setCCAEnd] = useState('');
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      const alerts = subjects
        .filter(s => s.deadline)
        .filter(s => {
          const due = new Date(s.deadline);
          return due >= now && due <= tomorrow;
        });
      if (alerts.length > 0) {
        alert(
          'Upcoming Deadline:\n' +
            alerts
              .map(s => `- ${s.name} - due by ${s.deadline}`)
              .join('\n')
        );
      }
    };
    checkDeadlines();
    const iv = setInterval(checkDeadlines, 24 * 60 * 60 * 1000);
    return () => clearInterval(iv);
  }, [subjects]);

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
    if (hasCCA && ccaStart && ccaEnd) {
      day = addBlocks(ccaStart, ccaEnd, 'CCA', list, day);
    }
    const latestEnd = [
      schoolEnd,
      hasCCA ? ccaEnd : null
    ]
      .filter(Boolean)
      .sort()
      .pop() || '08:00';
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

  if (page === 'planner') {
    return (
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
    );
  }

  if (page === 'schedule') {
    return (
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
    );
  }

  return null;
}

