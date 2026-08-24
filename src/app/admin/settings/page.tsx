'use client';

import PageHeader from '@/app/components/admin/PageHeader';
import { useState } from 'react';

function AccountSettingsForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (newPassword && newPassword !== confirmPassword) {
      setMessage('New passwords do not match.');
      return;
    }
    const res = await fetch('/api/admin/update-credentials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newUsername: newUsername || undefined, newPassword: newPassword || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || 'Update failed.');
      return;
    }
    setMessage('Credentials updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-700">Current Password</label>
        <input required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm text-slate-700">New Username</label>
        <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} type="text" className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm text-slate-700">New Password</label>
        <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm text-slate-700">Confirm New Password</label>
        <input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="mt-1 w-full rounded-md border px-3 py-2" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-white">Update</button>
        {message ? <div className="text-sm text-slate-700">{message}</div> : null}
      </div>
    </form>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        description="Configure dashboard preferences, account details, and system options for the landing site."
      />

      <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
        <div className="mb-6 flex items-center gap-3 text-slate-900">
          <h2 className="text-lg font-semibold">Workspace settings</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">
          Manage global preferences here. This is a placeholder for admin controls such as contact
          details, branding options, and integration settings.
        </p>
      </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
            <div className="mb-6 flex items-center gap-3 text-slate-900">
              <h2 className="text-lg font-semibold">Account Settings</h2>
            </div>
            <AccountSettingsForm />
          </div>
    </div>
  );
}
