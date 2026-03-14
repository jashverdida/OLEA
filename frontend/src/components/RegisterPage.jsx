import React, { useState } from 'react';

export default function RegisterPage({ onNavigate }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    // Add registration logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="bg-[var(--surface)] p-8 rounded-xl shadow-lg w-full max-w-md border border-[var(--border)]">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-transparent border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--cyan)]"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          </div>
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
          <div>
            <label className="block mb-1 font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 rounded bg-transparent border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--cyan)]"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-400 text-sm">{error}</div>}
          <button
            type="submit"
            className="w-full py-2 mt-2 rounded bg-[var(--cyan)] text-black font-semibold hover:bg-[var(--blue)] transition-colors"
          >
            Create Account
          </button>
        </form>
        <div className="flex justify-center mt-4 text-sm">
          <button className="text-[var(--cyan)] hover:underline" onClick={() => onNavigate('login')}>Already have an account? Log in</button>
        </div>
      </div>
    </div>
  );
}
