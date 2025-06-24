import React from 'react';
import StudyForm from './components/StudyForm';

function App() {
  return (
    <div style={{ fontFamily: 'Arial', padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#2a9d8f' }}>Mindful Study Scheduler</h2>
      <StudyForm />
    </div>
  );
}

export default App;
