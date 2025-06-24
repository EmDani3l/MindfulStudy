import React from 'react';

function DailyLogList({ logs }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <h3>Check-In History</h3>
      <ul>
        {logs.map((log, i) => (
          <li key={i}>
            <strong>{log.date}:</strong> Studied {log.subjects.join(', ')}<br />
            <em>{log.note}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DailyLogList;
