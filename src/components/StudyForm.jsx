import React, { useState } from 'react';
import ScheduleList from './ScheduleList';
import { addMinutes, isTimeUsed, addBlocks } from '../utils/scheduleUtils';

function StudyForm() {
  const [numSubjects, setNumSubjects] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [studyTime, setStudyTime] = useState(60);
  const [schoolStart, setSchoolStart] = useState('');
  const [schoolEnd, setSchoolEnd] = useState('');
  const [ccaStart, setCCAStart] = useState('');
  const [ccaEnd, setCCAEnd] = useState('');
  const [schedule, setSchedule] = useState([]);

  const handleSubjectCount = (e) => {
    const count = parseInt(e.target.value) || 0;
    setNumSubjects(count);
    setSubjects(new Array(count).fill(''));
  };

  const handleSubjectChange = (index, value) => {
    const updated = [...subjects];
    updated[index] = value;
    setSubjects(updated);
  };

  const generateSchedule = () => {
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

    let latestEnd = '08:00';
    if (schoolEnd && ccaEnd) latestEnd = schoolEnd > ccaEnd ? schoolEnd : ccaEnd;
    else if (schoolEnd) latestEnd = schoolEnd;
    else if (ccaEnd) latestEnd = ccaEnd;

    if (latestEnd > time) time = latestEnd;

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

      <h3>CCA</h3>
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

      <ScheduleList schedule={schedule} />
    </div>
  );
}

export default StudyForm;
