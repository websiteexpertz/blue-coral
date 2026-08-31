'use client';

import PageHeader from '@/app/components/admin/PageHeader';
import { useEffect, useState } from 'react';

function IcalSettingsForm() {
  const [url, setUrl] = useState('');
  const [refreshMinutes, setRefreshMinutes] = useState('5');
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/ical')
      .then((response) => response.json())
      .then((settings) => {
        setUrl(settings.url || '');
        setRefreshMinutes(String(settings.refreshMinutes || 5));
      })
      .catch(() => setMessage('Unable to load calendar settings.'));
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/ical', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, refreshMinutes: Number(refreshMinutes) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save calendar settings.');
      setUrl(data.url || '');
      setRefreshMinutes(String(data.refreshMinutes));
      setMessage('Calendar settings saved. The feed will refresh automatically.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save calendar settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black">iCal calendar URL</label>
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          type="url"
          placeholder="https://example.com/calendar.ics"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-black"
        />
        <p className="mt-1 text-xs text-black">Leave blank to disable external calendar imports.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-black">Refresh interval (minutes)</label>
        <input
          required
          min="1"
          max="60"
          value={refreshMinutes}
          onChange={(event) => setRefreshMinutes(event.target.value)}
          type="number"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-black"
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          disabled={isSaving}
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-black disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save calendar'}
        </button>
        {message ? <div className="text-sm text-slate-700">{message}</div> : null}
      </div>
    </form>
  );
}

function ContactInfoSettingsForm() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('Instagram');
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>({
    Instagram: '',
    Facebook: '',
    Twitter: '',
    Email: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/content')
      .then((response) => response.json())
      .then((content) => {
        const nextEmail = content?.contact?.email || '';
        const nextPhone = content?.contact?.phone || '';
        const existingLinks = Array.isArray(content?.footer?.socialLinks) ? content.footer.socialLinks : [];
        const nextSocialLinks: Record<string, string> = {
          Instagram: '',
          Facebook: '',
          Twitter: '',
          Email: '',
        };

        for (const link of existingLinks) {
          if (link && typeof link.platform === 'string' && typeof link.url === 'string') {
            nextSocialLinks[link.platform] = link.url;
          }
        }

        const firstPlatform =
          Object.entries(nextSocialLinks).find(([, url]) => url)?.[0] || 'Instagram';

        setEmail(nextEmail);
        setPhone(nextPhone);
        setSocialLinks(nextSocialLinks);
        setSocialPlatform(firstPlatform);
      })
      .catch(() => undefined);
  }, []);

  const selectedUrl = socialLinks[socialPlatform] || '';

  const handleSocialPlatformChange = (nextPlatform: string) => {
    setSocialPlatform(nextPlatform);
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const currentContentResponse = await fetch('/api/admin/content');
      const currentContent = await currentContentResponse.json();

      const existingLinks = Array.isArray(currentContent?.footer?.socialLinks)
        ? currentContent.footer.socialLinks
            .filter((link: { platform?: string; url?: string }) => link && typeof link.platform === 'string')
            .map((link: { platform?: string; url?: string }) => ({
              platform: String(link.platform),
              url: String(link.url || ''),
            }))
        : [];

      const mergedLinks: Record<string, string> = {};
      for (const link of existingLinks) {
        mergedLinks[link.platform] = link.url;
      }
      mergedLinks[socialPlatform] = socialLinks[socialPlatform] || '';

      const nextLinks = Object.entries(mergedLinks)
        .filter(([platform, url]) => platform && url && String(url).trim())
        .map(([platform, url]) => ({
          platform,
          url: String(url).trim(),
        }));

      const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentContent,
          contact: {
            ...(currentContent?.contact || {}),
            email: email.trim(),
            phone: phone.trim(),
          },
          footer: {
            ...(currentContent?.footer || {}),
            socialLinks: nextLinks,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save contact settings.');

      setMessage('Contact information saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save contact settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-black">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="hello@bluecorallanding.com"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black">Phone number</label>
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+1 (242) 555-0123"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-black"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-[180px_1fr]">
        <div>
          <label className="block text-sm font-medium text-black">Social platform</label>
          <select
            value={socialPlatform}
            onChange={(event) => handleSocialPlatformChange(event.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black"
          >
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="Twitter">Twitter</option>
            <option value="Email">Email</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black">Social link</label>
          <input
            type="url"
            value={selectedUrl}
            onChange={(event) =>
              setSocialLinks((current) => ({
                ...current,
                [socialPlatform]: event.target.value,
              }))
            }
            placeholder="https://instagram.com/bluecorallanding"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-black"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          disabled={isSaving}
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-white disabled:opacity-60"
        >
          {isSaving ? 'Saving...' : 'Save contact info'}
        </button>
        {message ? <div className="text-sm text-slate-700">{message}</div> : null}
      </div>
    </form>
  );
}

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
      body: JSON.stringify({
        currentPassword,
        newUsername: newUsername || undefined,
        newPassword: newPassword || undefined,
      }),
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
        <label className="block text-sm font-medium text-black">Current Password</label>
        <input
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          type="password"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black">New Username</label>
        <input
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          type="text"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black">New Password</label>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-black"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-black">Confirm New Password</label>
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-black placeholder:text-black"
        />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-md bg-primary px-4 py-2 text-white">
          Update
        </button>
        {message ? <div className="text-sm text-slate-700">{message}</div> : null}
      </div>
    </form>
  );
}

export default function AdminSettingsPage() {
  const [publicCalendarUrl, setPublicCalendarUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPublicCalendarUrl(`${window.location.origin}/api/calendar/sync.ics`);
    }
  }, []);

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
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">External calendar</h2>
          <p className="mt-1 text-sm text-slate-600">
            Import blocked dates from an iCal feed for the public availability calendar.
          </p>
        </div>
        <IcalSettingsForm />
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Contact info</h2>
          <p className="mt-1 text-sm text-slate-600">
            Update the public contact details shown in the website footer and inquiry sections.
          </p>
        </div>
        <ContactInfoSettingsForm />
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/95 p-6 shadow-[0_25px_80px_rgba(27,79,107,0.06)]">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Public iCal link</h2>
          <p className="mt-1 text-sm text-slate-600">
            Share this URL with Airbnb, Booking.com, or other calendars to sync your direct
            bookings.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-black">Your calendar URL</label>
          <div className="flex gap-3">
            <input
              readOnly
              value={publicCalendarUrl}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-black"
            />
            <button
              type="button"
              onClick={async (event) => {
                const value = publicCalendarUrl;
                if (!value) return;

                const button = event.currentTarget as HTMLButtonElement;
                const originalText = button.textContent;

                try {
                  await navigator.clipboard.writeText(value);
                  button.textContent = 'Copied';
                  window.setTimeout(() => {
                    button.textContent = originalText;
                  }, 1500);
                } catch {
                  button.textContent = 'Copy failed';
                  window.setTimeout(() => {
                    button.textContent = originalText;
                  }, 1500);
                  window.alert('Unable to copy automatically. Please copy the URL manually.');
                }
              }}
              className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              Copy
            </button>
          </div>
        </div>
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
