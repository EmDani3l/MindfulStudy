import React, { useState } from 'react';

function CheckIn({ schedule }) {
  const today = 1; // You can improve this later to use the actual date
  const todaysTasks = Array.isArray(schedule)
    ? schedule.filter(item => item.day === today)
    : [];

  const [completed, setCompleted] = useState([]);

  const toggleTask = (time) => {
    setCompleted((prev) =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  const getMessage = () => {
    const total = todaysTasks.length;
    const done = completed.length;
    if (total === 0) return "No scheduled tasks today.";
    if (done === total) return "🎉 All done! Great job!";
    if (done === 0) return "Try to check off at least one!";
    return `Progress: ${done}/${total} tasks completed`;
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Today's Check-In</h3>
      {todaysTasks.map((task, i) => (
        <div key={i}>
          <input
            type="checkbox"
            id={`task-${i}`}
            checked={completed.includes(task.time)}
            onChange={() => toggleTask(task.time)}
          />
          <label htmlFor={`task-${i}`}>{task.time} - {task.activity}</label>
        </div>
      ))}
      <p style={{ fontWeight: 'bold', marginTop: '10px' }}>{getMessage()}</p>
    </div>
  );
}

export default CheckIn;
