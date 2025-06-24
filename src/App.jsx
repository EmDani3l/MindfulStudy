import React, { useState } from 'react';
import StudyForm from './components/StudyForm';
import CheckIn from './components/CheckIn';
import { saveScheduleToBackend } from './utils/api';

function App() {
  const [schedule, setSchedule] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [studyTime, setStudyTime] = useState(60);
  const [saveMsg, setSaveMsg] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <div style={{ fontFamily: 'Arial', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#2a9d8f' }}>Mindful Study Scheduler</h2>

      {/* Pass down state setters for shared data */}
      <StudyForm
        setSchedule={setSchedule}
        setSubjects={setSubjects}
        setStudyTime={setStudyTime}
      />

      {/* Show check-in interface based on schedule */}
      <CheckIn schedule={schedule} />

      {/* Save to backend button */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={async () => {
            setLoading(true);
            setSaveMsg('');
            const result = await saveScheduleToBackend({ schedule, subjects, studyTime });
            if (result.success) {
              setSaveMsg('Schedule saved to database!');
            } else {
              setSaveMsg(`Failed to save: ${result.error}`);
            }
            setLoading(false);
          }}
          disabled={loading || !schedule.length}
          style={{
            padding: '10px 20px',
            backgroundColor: '#264653',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Saving...' : 'Save to Database'}
        </button>

        {saveMsg && <div style={{ marginTop: '10px', color: '#2a9d8f' }}>{saveMsg}</div>}
      </div>
    </div>
  );
}

export default App;
