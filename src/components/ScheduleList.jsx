import React from 'react';

function ScheduleList({ schedule }) {
  return (
    <div>
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

export default ScheduleList;
