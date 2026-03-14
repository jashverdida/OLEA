import React, { useState } from 'react';

export default function ForgotPasswordPage({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required.');
      return;
    }
    setError('');
    setSent(true);
    // Add forgot password logic here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="bg-[var(--surface)] p-8 rounded-xl shadow-lg w-full max-w-md border border-[var(--border)]">
        <h2 className="text-2xl font-bold mb-6 text-center">Forgot Password</h2>
        {sent ? (
          <div className="text-green-400 text-center mb-4">Reset link sent to your email.</div>
        ) : (
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
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full py-2 mt-2 rounded bg-[var(--cyan)] text-black font-semibold hover:bg-[var(--blue)] transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        )}
        <div className="flex justify-center mt-4 text-sm">
          <button className="text-[var(--cyan)] hover:underline" onClick={() => onNavigate('login')}>Back to Login</button>
        </div>
      </div>
    </div>
  );
}
