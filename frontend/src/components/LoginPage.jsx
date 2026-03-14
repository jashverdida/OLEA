import React, { useState } from 'react';


export default function LoginPage({ onNavigate, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    // Simulate successful login
    if (onLogin) onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="bg-[var(--surface)] p-8 rounded-xl shadow-lg w-full max-w-md border border-[var(--border)]">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email address</label>
            <input
              type="email"
              className="w-full px-4 py-2 rounded bg-transparent border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--cyan)]"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded bg-transparent border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--cyan)]"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 mt-2 rounded bg-[var(--cyan)] text-black font-semibold hover:bg-[var(--blue)] transition-colors"
          >
            Sign In
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <button className="text-[var(--cyan)] hover:underline" onClick={() => onNavigate('forgot')}>Forgot Password?</button>
          <button className="text-[var(--cyan)] hover:underline" onClick={() => onNavigate('register')}>Don't have an account? Sign up</button>
        </div>
      </div>
    </div>
  );
}
