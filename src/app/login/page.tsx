'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => {
        if (!mounted) return;
        if (d?.authenticated) router.replace('/admin');
      })
      .catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || 'Login failed');
      return;
    }
    router.replace('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
        <p className="text-sm text-slate-500 mb-6">Sign in to access the admin dashboard.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-700">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-slate-700">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <div className="pt-2">
            <button className="w-full rounded-md bg-primary px-4 py-2 text-white">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
