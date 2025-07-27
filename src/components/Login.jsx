import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login({ onLogin, onRegister, onGoogle }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [error, setError] = useState('');

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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        padding: 16,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 320,
          padding: 24,
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginBottom: 16 }}>
          {mode === 'login' ? 'Login' : 'Register'}
        </h2>

        <form
          onSubmit={submit}
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            style={{
              padding: 10,
              fontSize: 14,
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{
              padding: 10,
              fontSize: 14,
              borderRadius: 4,
              border: '1px solid #ccc',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 0',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: 'pointer',
            }}
          >
            {mode === 'login' ? 'Log In' : 'Sign Up'}
          </button>
          {error && (
            <div style={{ color: 'red', marginTop: 4 }}>{error}</div>
          )}
        </form>

        <div style={{ margin: '24px 0' }}>
          <GoogleLogin
            onSuccess={(cred) => onGoogle(cred.credential)}
            onError={() => setError('Google login failed')}
          />
        </div>

        {mode === 'login' ? (
          <p style={{ fontSize: 14 }}>
            Need an account?{' '}
            <button
              onClick={() => setMode('register')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                cursor: 'pointer',
                padding: 0,
                fontSize: 14,
              }}
            >
              Register
            </button>
          </p>
        ) : (
          <p style={{ fontSize: 14 }}>
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                cursor: 'pointer',
                padding: 0,
                fontSize: 14,
              }}
            >
              Login
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
