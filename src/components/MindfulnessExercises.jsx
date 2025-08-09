import React, { useState, useEffect } from 'react';

export default function MindfulnessExercises({ page }) {
  const [favorites, setFavorites] = useState([]);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: '',
    tip: ''
  });
  const relaxationTips = [
    'Take 5 deep breaths',
    'Stretch your arms and legs',
    'Drink water slowly',
    "Write something you're grateful for",
    'Play soft background music',
    'Step outside for 2 minutes'
  ];

  function toggleFavorite(tip) {
    setFavorites(f =>
      f.includes(tip) ? f.filter(x => x !== tip) : [...f, tip]
    );
  }

  function surpriseMe() {
    const pool = relaxationTips.filter(t => !favorites.includes(t));
    const all = pool.length ? pool : relaxationTips;
    handleTipClick(all[Math.floor(Math.random() * all.length)]);
  }

  function handleTipClick(tip) {
    if (tip === 'Take 5 deep breaths') {
      setModalConfig({ visible: true, type: 'breathing', tip });
    } else if (tip === "Write something you're grateful for") {
      setModalConfig({ visible: true, type: 'gratitude', tip });
    } else {
      setModalConfig({ visible: true, type: 'generic', tip });
    }
  }

  if (page !== 'relax') return null;

  return (
    <>
      <h2>Relaxation Tips</h2>
      <button
        onClick={surpriseMe}
        style={{
          marginBottom: 12,
          padding: '8px 12px',
          border: 'none',
          background: '#4caf50',
          color: 'white',
          borderRadius: 6,
          cursor: 'pointer'
        }}
      >
        Surprise me
      </button>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {relaxationTips.map(tip => (
          <li
            key={tip}
            style={{
              marginBottom: 8,
              background: favorites.includes(tip) ? '#f5f5f5' : '#fff',
              padding: '12px 16px',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'transform .1s'
            }}
            onClick={() => handleTipClick(tip)}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <span>{tip}</span>
            <span
              onClick={e => { e.stopPropagation(); toggleFavorite(tip); }}
              style={{ cursor: 'pointer', fontSize: 18 }}
            >
              {favorites.includes(tip) ? '★' : '☆'}
            </span>
          </li>
        ))}
      </ul>

      {modalConfig.visible && (
        <Modal onClose={() => setModalConfig({ visible: false, type: '', tip: '' })}>
          {modalConfig.type === 'breathing' && <BreathingModal onDone={() => setModalConfig({ visible: false, type: '', tip: '' })} />}
          {modalConfig.type === 'gratitude' && <GratitudeModal onDone={() => setModalConfig({ visible: false, type: '', tip: '' })} />}
          {modalConfig.type === 'generic' && (
            <div style={{ padding: 20 }}>
              <p>{modalConfig.tip}</p>
              <button onClick={() => setModalConfig({ visible: false, type: '', tip: '' })}>Close</button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}

function Modal({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 8, padding: 20, maxWidth: 300, width: '100%' }}
      >
        {children}
      </div>
    </div>
  );
}

function BreathingModal({ onDone }) {
  const [count, setCount] = useState(5);
  const [inhale, setInhale] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      if (count === 0) {
        clearInterval(iv);
        onDone();
      } else {
        setInhale(i => !i);
        if (!inhale) setCount(c => c - 1);
      }
    }, 4000);
    return () => clearInterval(iv);
  }, [count, inhale, onDone]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h3>{inhale ? 'Inhale…' : 'Exhale…'}</h3>
      <div
        style={{
          margin: '20px auto',
          width: inhale ? 150 : 80,
          height: inhale ? 150 : 80,
          borderRadius: '50%',
          background: '#90caf9',
          transition: 'all 3.5s ease-in-out'
        }}
      />
      <p>Breaths left: {count}</p>
    </div>
  );
}

function GratitudeModal({ onDone }) {
  const [text, setText] = useState('');

  function save() {
    if (text.trim()) alert(`You wrote: "${text.trim()}"`);
    onDone();
  }

  return (
    <div>
      <h3>What are you grateful for?</h3>
      <textarea
        rows={4}
        style={{ width: '100%', marginBottom: 10 }}
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={save} style={{ marginRight: 8 }}>Save</button>
      <button onClick={onDone}>Cancel</button>
    </div>
  );
}
