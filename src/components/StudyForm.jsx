import React, { useState } from 'react';
import ScheduleList from './ScheduleList';
import { addMinutes, isTimeUsed, addBlocks } from '../utils/scheduleUtils';

function StudyForm({ setSchedule, setSubjects, setStudyTime }) {
  const [numSubjects, setNumSubjects] = useState(0);
  const [localSubjects, setLocalSubjects] = useState([]);
  const [localStudyTime, updateLocalStudyTime] = useState(60);
  const [schoolStart, setSchoolStart] = useState('');
  const [schoolEnd, setSchoolEnd] = useState('');
  const [ccaStart, setCCAStart] = useState('');
  const [ccaEnd, setCCAEnd] = useState('');
  const [localSchedule, setLocalSchedule] = useState([]);

  const handleSubjectCount = (e) => {
    const count = parseInt(e.target.value) || 0;
    setNumSubjects(count);
    const blankList = new Array(count).fill('');
    setLocalSubjects(blankList);
    setSubjects(blankList); // sync with parent
  };

  const handleSubjectChange = (index, value) => {
    const updated = [...localSubjects];
    updated[index] = value;
    setLocalSubjects(updated);
    setSubjects(updated); // sync with parent
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

    for (let subject of localSubjects) {
      if (subject.trim() !== '') {
        list.push({ time, activity: 'Study: ' + subject, day });
        next = addMinutes(time, parseInt(localStudyTime), day);
        time = next.time;
        day = next.day;
        studied += parseInt(localStudyTime);

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
    setSchedule(list);          // pass to parent
    setLocalSchedule(list);     // show locally
    setStudyTime(localStudyTime); // pass to parent
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
        <input
          type="number"
          value={numSubjects}
          onChange={handleSubjectCount}
          style={inputStyle}
        />
      </div>

      {localSubjects.map((subj, index) => (
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
        <input
          type="number"
          value={localStudyTime}
          onChange={(e) => {
            updateLocalStudyTime(e.target.value);
            setStudyTime(e.target.value); // sync to parent
          }}
          style={inputStyle}
        />
      </div>

      <hr />
      <h3>School</h3>
      <label>Start Time:</label><br />
      <input
        type="time"
        value={schoolStart}
        onChange={(e) => setSchoolStart(e.target.value)}
        style={inputStyle}
      /><br />
      <label>End Time:</label><br />
      <input
        type="time"
        value={schoolEnd}
        onChange={(e) => setSchoolEnd(e.target.value)}
        style={inputStyle}
      />

      <h3>CCA</h3>
      <label>Start Time:</label><br />
      <input
        type="time"
        value={ccaStart}
        onChange={(e) => setCCAStart(e.target.value)}
        style={inputStyle}
      /><br />
      <label>End Time:</label><br />
      <input
        type="time"
        value={ccaEnd}
        onChange={(e) => setCCAEnd(e.target.value)}
        style={inputStyle}
      />

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

      <ScheduleList schedule={localSchedule} />
    </div>
  );
}

export default StudyForm;
