import React, { useState } from 'react';

export default function MoodCheckIn({ page, onNegativeMood }) {
  const [mood, setMood] = useState('');
  const [moodReason, setMoodReason] = useState('');
  const [logs, setLogs] = useState([]);

  function handleMoodSubmit(e) {
    e.preventDefault();
    if (!mood) return;
    const txt = (mood + ' ' + moodReason).toLowerCase();
    const negWords = [
      'sad',
      'stress',
      'depress',
      'anxious',
      'angry',
      'tired',
      'cry',
      'panic',
      'burnt out',
      'overwhelmed',
      'hopeless',
      'worthless'
    ];
    const isNeg = negWords.some(w => txt.includes(w));
    setLogs(ls => [
      ...ls,
      { mood, moodReason, time: new Date().toLocaleString() }
    ]);
    if (isNeg && onNegativeMood) {
      onNegativeMood();
    }
    setMood('');
    setMoodReason('');
  }

  if (page !== 'checkin') return null;

  return (
    <>
      <h2>Mood Check‑In</h2>
      <form onSubmit={handleMoodSubmit}>
        <label>How do you feel?</label>
        <input
          type="text"
          value={mood}
          onChange={e => setMood(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <label>Why do you feel this way?</label>
        <textarea
          value={moodReason}
          onChange={e => setMoodReason(e.target.value)}
          style={{ width: '100%', marginBottom: 8 }}
        />
        <button
          type="submit"
          style={{ background: '#ff9800', color: 'white', padding: 10, border: 'none', borderRadius: 6 }}
        >
          Submit
        </button>
      </form>
      <ul>
        {logs.map((log, i) => (
          <li key={i}>
            {log.time} — {log.mood} ({log.moodReason})
          </li>
        ))}
      </ul>
    </>
  );
}
