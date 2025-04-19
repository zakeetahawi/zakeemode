import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onLogin(username);
    } else {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-white">
      <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm flex flex-col gap-4 border border-blue-100">
        <h2 className="text-2xl font-extrabold text-blue-800 text-center mb-2">تسجيل الدخول</h2>
        {error && <div className="text-red-600 text-center font-bold">{error}</div>}
        <div>
          <label className="block mb-1 font-semibold text-blue-900">اسم المستخدم</label>
          <input
            type="text"
            className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold text-blue-900">كلمة المرور</label>
          <input
            type="password"
            className="w-full border-2 border-blue-100 rounded-lg p-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="px-8 py-2 bg-gradient-to-l from-blue-700 to-blue-500 text-white rounded-full shadow-md hover:scale-105 hover:from-blue-800 hover:to-blue-600 transition-all duration-200 font-bold text-lg mt-2">دخول</button>
      </form>
    </div>
  );
}
