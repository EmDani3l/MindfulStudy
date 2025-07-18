import React, { useState } from 'react';

export default function Login({ onLogin, onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  async function submit(e) {
    e.preventDefault();
    if (mode === 'login') {
      const ok = await onLogin(username, password);
      if (!ok) setError('Invalid credentials');
      else setError('');
    } else {
      const ok = await onRegister(username, password);
      if (ok) {
        setMode('login');
        setError('');
      } else {
        setError('Registration failed');
      }
    }
  }

  return (
    <div style={{ maxWidth: 300, margin: '100px auto', textAlign: 'center' }}>
      <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          placeholder="Username"
          style={{ padding: 8 }}
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          style={{ padding: 8 }}
        />
        <button
          type="submit"
          style={{ padding: 8, background: '#4caf50', color: 'white', border: 'none', borderRadius: 4 }}
        >
          {mode === 'login' ? 'Log In' : 'Sign Up'}
         </button>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
      {mode === 'login' ? (
        <p style={{ marginTop: 8 }}>
          Need an account?{' '}
          <a href="#" onClick={() => setMode('register')}>
            Register
          </a>
        </p>
      ) : (
        <p style={{ marginTop: 8 }}>
          Already have an account?{' '}
          <a href="#" onClick={() => setMode('login')}>
            Login
          </a>
        </p>
      )}
    </div>
  );
}