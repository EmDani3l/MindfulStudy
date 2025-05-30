import React, { useState } from 'react';

function App() {
  const [numSubjects, setNumSubjects] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [studyTime, setStudyTime] = useState(60);
  const [schoolStart, setSchoolStart] = useState('');
  const [schoolEnd, setSchoolEnd] = useState('');
  const [ccaStart, setCCAStart] = useState('');
  const [ccaEnd, setCCAEnd] = useState('');
  const [schedule, setSchedule] = useState([]);
  const [currentDay, setCurrentDay] = useState(1);

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
    while (current.time < end || current.day < day) {
      if (!isTimeUsed(current.time, current.day, list)) {
        list.push({ time: current.time, activity: name, day: current.day });
      }
      current = addMinutes(current.time, 60, current.day);
    }
    return current.day;
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

  function generateSchedule() {
    let list = [];
    let time = '08:00';
    let day = 1;
    let studied = 0;

    //breakfast
    list.push({ time, activity: 'Breakfast', day });
    let next = addMinutes(time, 60, day);
    time = next.time;
    day = next.day;

    //school and CCA
    day = addBlocks(schoolStart, schoolEnd, 'School', list, day);
    day = addBlocks(ccaStart, ccaEnd, 'Co-curricular Activity', list, day);

    //latest end time
    let latestEnd = '08:00';
    if (schoolEnd && ccaEnd) {
      latestEnd = schoolEnd > ccaEnd ? schoolEnd : ccaEnd;
    } else if (schoolEnd) {
      latestEnd = schoolEnd;
    } else if (ccaEnd) {
      latestEnd = ccaEnd;
    }

    if (latestEnd > time) time = latestEnd;

    // study sessions
    for (let subject of subjects) {
      if (subject.trim() !== '') {
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
    setCurrentDay(day);
  }

  const inputStyle = {
    margin: '5px 0',
    padding: '5px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    backgroundColor: '#f9f9f9'
  };

  return (
    <div style={{ fontFamily: 'Arial',
                  padding: '20px', 
                  maxWidth: '500px', 
                  margin: '0 auto'
                 }}>
                  
      <h2 style={{ textAlign: 'center', color: '#2a9d8f' }}>Mindful Study Scheduler</h2>

      <div>
        <label>Number of Subjects: </label><br />
        <input type="number" value={numSubjects} onChange={handleSubjectCount} style={inputStyle} />
      </div>

      {subjects.map((subj, index) => (
        <div key={index}>
          <label>Subject {index + 1}:</label><br />
          <input
            type="text"
            value={subj}
            onChange={(e) => handleSubjectChange(index, e.target.value)}
            style={inputStyle}
          />
        </div>
      ))}

      <div>
        <label>Study Time per Subject (minutes):</label><br />
        <input type="number" value={studyTime} onChange={(e) => setStudyTime(e.target.value)} style={inputStyle} />
      </div>

      <hr />
      <h3>School</h3>
      <label>Start Time:</label><br />
      <input type="time" value={schoolStart} onChange={(e) => setSchoolStart(e.target.value)} style={inputStyle} /><br />
      <label>End Time:</label><br />
      <input type="time" value={schoolEnd} onChange={(e) => setSchoolEnd(e.target.value)} style={inputStyle} />

      <h3> CCA</h3>
      <label>Start Time:</label><br />
      <input type="time" value={ccaStart} onChange={(e) => setCCAStart(e.target.value)} style={inputStyle} /><br />
      <label>End Time:</label><br />
      <input type="time" value={ccaEnd} onChange={(e) => setCCAEnd(e.target.value)} style={inputStyle} />

      <br /><br />
      <button
        onClick={generateSchedule}
        style={{
          padding: '10px 20px',
          backgroundColor: '#2a9d8f',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Generate Schedule
      </button>

      <h3> Your Schedule:</h3>
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

export default App;
