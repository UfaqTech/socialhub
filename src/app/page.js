'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock3, LogOut, ShieldCheck } from 'lucide-react';

const fetchLinks = async (status) => {
  const response = await fetch(`/api/links?status=${status}`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to load links');
  }
  return response.json();
};

export default function AdminPage() {
  const router = useRouter();
  const [pendingLinks, setPendingLinks] = useState([]);
  const [approvedLinks, setApprovedLinks] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const [pendingData, approvedData] = await Promise.all([
        fetchLinks('pending'),
        fetchLinks('approved'),
      ]);

      setPendingLinks(pendingData.data || []);
      setApprovedLinks(approvedData.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = window.localStorage.getItem('admin-authenticated');
    if (!token) {
      router.push('/login');
      return;
    }

    loadData();
  }, [router]);

  const updateLink = async (id, action) => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, action }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Action failed');
      }

      await loadData();
      setMessage({ type: 'success', text: result.message });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Action failed' });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const stats = [
    {
      label: 'Total Submitted',
      value: pendingLinks.length + approvedLinks.length,
      icon: ShieldCheck,
    },
    {
      label: 'Pending Approvals',
      value: pendingLinks.length,
      icon: Clock3,
    },
    {
      label: 'Approved / Live',
      value: approvedLinks.length,
      icon: CheckCircle2,
    },
  ];

  const renderLinkCard = (link, isPending) => (
    <div
      key={link.id}
      className="rounded-2xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/20"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-300/80">{link.category || 'Uncategorized'}</p>
          <h3 className="text-lg font-semibold text-slate-100">{link.title || 'Untitled Link'}</h3>
          <p className="text-sm text-slate-400">Platform: {link.platform || 'N/A'} · Type: {link.sub_type || 'N/A'}</p>
          <p className="text-sm text-slate-400">Submitted by: {link.user_id || 'unknown'}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-800 px-3 py-1">{link.status}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={link.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-sky-200 transition hover:bg-slate-800"
        >
          <span className="truncate">Open Link</span>
        </a>
        <div className="flex flex-wrap gap-2">
          {isPending ? (
            <>
              <button
                type="button"
                onClick={() => updateLink(link.id, 'approve')}
                className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                disabled={loading}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => updateLink(link.id, 'delete')}
                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
                disabled={loading}
              >
                Delete
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => updateLink(link.id, 'delete')}
              className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400"
              disabled={loading}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/80 p-6 shadow-2xl shadow-slate-950/10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300/80">Admin Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">UfaqTech Link Approvals</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Approve incoming links from your Android app and keep the live feed synced instantly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-800/90 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-700 hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-5 shadow-xl shadow-slate-950/20"
            >
              <div className="flex items-center gap-3 text-slate-300">
                <item.icon className="h-5 w-5 text-sky-400" />
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">{item.label}</p>
              </div>
              <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </section>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-4">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock3 />
              <span>Approval queues are updated live from Supabase.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-3xl border border-slate-800/80 bg-slate-950/80 p-3 text-sm text-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab('pending')}
              className={`rounded-full px-4 py-2 transition ${activeTab === 'pending' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('approved')}
              className={`rounded-full px-4 py-2 transition ${activeTab === 'approved' ? 'bg-sky-500 text-slate-950' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'}`}
            >
              Approved
            </button>
          </div>
        </div>

        {message ? (
          <div
            className={`mt-6 rounded-3xl border px-4 py-4 text-sm ${message.type === 'error'
              ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`
          }
          >
            {message.text}
          </div>
        ) : null}

        <section className="mt-6 space-y-4">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6">
            <h2 className="text-xl font-semibold text-white">{activeTab === 'pending' ? 'Pending Approval' : 'Approved Links'}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {activeTab === 'pending'
                ? 'Review and approve or delete links submitted from the Android app.'
                : 'Manage live links and remove any spam or outdated content.'}
            </p>

            {loading ? (
              <div className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 text-center text-slate-400">
                Loading links...
              </div>
            ) : (activeTab === 'pending' ? (
              pendingLinks.length ? (
                <div className="mt-8 grid gap-4">
                  {pendingLinks.map((link) => renderLinkCard(link, true))}
                </div>
              ) : (
                <div className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 text-center text-slate-400">
                  No pending links available.
                </div>
              )
            ) : approvedLinks.length ? (
              <div className="mt-8 grid gap-4">
                {approvedLinks.map((link) => renderLinkCard(link, false))}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-slate-800/80 bg-slate-900/80 p-8 text-center text-slate-400">
                No approved links available.
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
