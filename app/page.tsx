'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type LinkItem = {
  id: string;
  title?: string;
  platform?: string;
  category?: string;
  status?: string;
  url?: string;
  image_url?: string;
  sub_type?: string;
  created_at?: string;
  submitter_name?: string;
  submitter_email?: string;
  submitter_hint?: string;
};

type ProfileItem = {
  id: string;
  email?: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
};

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileRole, setProfileRole] = useState('user');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePassword, setProfilePassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [userSubmissionFilter, setUserSubmissionFilter] = useState('');

  const pendingCount = useMemo(() => links.filter((link) => link.status === 'pending').length, [links]);
  const approvedCount = useMemo(() => links.filter((link) => link.status === 'approved').length, [links]);
  const rejectedCount = useMemo(() => links.filter((link) => link.status === 'rejected').length, [links]);

  const filteredProfiles = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return profiles.filter((profile) => {
      const name = (profile.full_name || '').toLowerCase();
      const email = (profile.email || '').toLowerCase();
      const role = (profile.role || 'user').toLowerCase();
      const matchesSearch = !term || name.includes(term) || email.includes(term);
      const matchesFilter = userFilter === 'all' ? true : role === userFilter;
      return matchesSearch && matchesFilter;
    });
  }, [profiles, searchTerm, userFilter]);

  const visibleLinks = useMemo(() => {
    return links.filter((link) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = !search || (link.title || '').toLowerCase().includes(search) || (link.url || '').toLowerCase().includes(search) || (link.submitter_email || '').toLowerCase().includes(search);
      const matchesUser = !userSubmissionFilter || (link.submitter_email || '').toLowerCase() === userSubmissionFilter.toLowerCase();
      return matchesSearch && matchesUser;
    });
  }, [links, searchTerm, userSubmissionFilter]);

  useEffect(() => {
    const savedEmail = window.localStorage.getItem('socialhub_admin_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setIsLoggedIn(true);
      void loadData();
    }

    const handleResize = () => setIsMobile(window.innerWidth < 900);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const interval = window.setInterval(() => {
      void loadData();
    }, 7000);
    return () => window.clearInterval(interval);
  }, [isLoggedIn]);

  async function loadData() {
    try {
      const response = await fetch('/api/admin/data', { cache: 'no-store' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to load dashboard data');
      setLinks(Array.isArray(result.links) ? result.links : []);
      setProfiles(Array.isArray(result.profiles) ? result.profiles : []);
      setError('');
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      return false;
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Login failed');

      window.localStorage.setItem('socialhub_admin_email', email);
      setIsLoggedIn(true);
      setStatusMessage('Connected to admin console');
      const loaded = await loadData();
      if (!loaded) {
        setIsLoggedIn(false);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    window.localStorage.removeItem('socialhub_admin_email');
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
    setStatusMessage('Disconnected');
  }

  async function approveLink(linkId: string) {
    try {
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Approval failed');
      setLinks((current) => current.map((link) => (link.id === linkId ? { ...link, status: 'approved' } : link)));
      setStatusMessage('Submission approved successfully');
      setError('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Approval failed';
      setError(message);
    }
  }

  async function rejectLink(linkId: string) {
    try {
      const response = await fetch('/api/admin/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkId }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Rejection failed');
      setLinks((current) => current.map((link) => (link.id === linkId ? { ...link, status: 'rejected' } : link)));
      setStatusMessage('Submission rejected');
      setError('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Rejection failed';
      setError(message);
    }
  }

  function selectProfile(profile: ProfileItem) {
    setSelectedProfileId(profile.id);
    setProfileName(profile.full_name || '');
    setProfileRole(profile.role || 'user');
    setProfileEmail(profile.email || '');
    setProfilePassword('');
  }

  async function saveProfile() {
    if (!selectedProfileId) return;
    setSavingProfile(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/users/${selectedProfileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: profileName, email: profileEmail, role: profileRole, password: profilePassword || undefined }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Profile update failed');
      await loadData();
      setProfilePassword('');
      setStatusMessage('Profile updated');
      setError('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Profile update failed';
      setError(message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function deleteProfile(profile: ProfileItem) {
    try {
      const response = await fetch(`/api/admin/users/${profile.id}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Profile deletion failed');
      setProfiles((current) => current.filter((item) => item.id !== profile.id));
      setStatusMessage('Profile removed from admin view');
      setError('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Profile deletion failed';
      setError(message);
    }
  }

  function viewUserSubmissions(profile: ProfileItem) {
    setUserSubmissionFilter(profile.email || '');
    setActiveTab('moderation');
    setStatusMessage(`Showing submissions for ${profile.email || profile.full_name || 'selected user'}`);
  }

  function getPreviewUrl(link: LinkItem) {
    if (link.image_url) return link.image_url;
    try {
      const domain = new URL(link.url || '').hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return 'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=200&q=80';
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc' }}>
      <style jsx global>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Arial, sans-serif; }
        @media (max-width: 900px) {
          .dashboard-shell { flex-direction: column !important; }
          .sidebar { width: 100% !important; border-right: none !important; border-bottom: 1px solid #1e293b; }
          .content-section { padding: 16px !important; }
        }
      `}</style>

      {!isLoggedIn ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ width: '100%', maxWidth: 460, background: '#111827', borderRadius: 24, padding: 32, border: '1px solid #334155' }}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>UfaqTech SocialHub</h1>
            <p style={{ margin: '8px 0 24px', color: '#94a3b8' }}>Secure Admin Console</p>
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: 16 }}>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b' }}>Admin Email</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="admin@example.com" style={inputStyle} />
              </label>
              <label style={{ display: 'grid', gap: 8 }}>
                <span style={{ fontSize: 12, textTransform: 'uppercase', color: '#64748b' }}>Password</span>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" style={inputStyle} />
              </label>
              {error ? <div style={{ color: '#fda4af', fontSize: 14 }}>{error}</div> : null}
              <button type="submit" disabled={loading} style={{ ...buttonStyle, opacity: loading ? 0.8 : 1 }}>
                {loading ? 'Authenticating...' : 'Secure Access Portal'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="dashboard-shell" style={{ display: 'flex', minHeight: '100vh' }}>
          <aside className="sidebar" style={{ width: 280, borderRight: '1px solid #1e293b', background: '#111827', padding: 20, position: isMobile ? 'static' : 'sticky', top: 0, height: isMobile ? 'auto' : '100vh' }}>
            <h2 style={{ margin: '0 0 24px', fontSize: 20 }}>UfaqTech Admin</h2>
            <nav style={{ display: 'grid', gap: 8 }}>
              {[
                { key: 'overview', label: 'Real-Time Analytics' },
                { key: 'moderation', label: `Moderation Queue (${pendingCount})` },
                { key: 'users', label: 'User Management' },
                { key: 'categories', label: 'Category & Content' },
              ].map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ ...navButtonStyle, background: activeTab === tab.key ? '#1d4ed8' : 'transparent' }}>
                  {tab.label}
                </button>
              ))}
            </nav>
            <div style={{ marginTop: 20, borderTop: '1px solid #1e293b', paddingTop: 16, display: 'grid', gap: 10 }}>
              <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 12 }}>
                <div style={{ fontSize: 12, color: '#38bdf8', textTransform: 'uppercase' }}>Live Updates</div>
                <div style={{ marginTop: 6, fontWeight: 700 }}>Auto-refresh every 7s</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 13 }}>
                <span>Pending</span>
                <strong style={{ color: '#f59e0b' }}>{pendingCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 13 }}>
                <span>Approved</span>
                <strong style={{ color: '#34d399' }}>{approvedCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 13 }}>
                <span>Rejected</span>
                <strong style={{ color: '#f87171' }}>{rejectedCount}</strong>
              </div>
            </div>
            <div style={{ marginTop: 24, borderTop: '1px solid #1e293b', paddingTop: 16 }}>
              <button onClick={handleLogout} style={{ ...buttonStyle, background: '#be123c', width: '100%' }}>Disconnect Console</button>
            </div>
          </aside>
          <section className="content-section" style={{ flex: 1, padding: 24, overflow: 'auto' }}>
            {error ? <div style={{ marginBottom: 16, padding: '10px 12px', background: '#7f1d1d', borderRadius: 12, color: '#fecaca' }}>{error}</div> : null}
            {statusMessage ? <div style={{ marginBottom: 16, padding: '10px 12px', background: '#1e3a8a', borderRadius: 12, color: '#bfdbfe' }}>{statusMessage}</div> : null}

            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <h1 style={{ margin: 0, fontSize: 28 }}>System Performance</h1>
                    <p style={{ margin: '6px 0 0', color: '#94a3b8' }}>Live dashboard of submissions and user activity.</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  {[
                    { label: 'Total Links', value: links.length, color: '#38bdf8' },
                    { label: 'Approved Links', value: approvedCount, color: '#34d399' },
                    { label: 'Pending Links', value: pendingCount, color: '#f59e0b' },
                    { label: 'Registered Users', value: profiles.length, color: '#a78bfa' },
                  ].map((card) => (
                    <div key={card.label} style={{ background: '#111827', border: '1px solid #334155', borderRadius: 20, padding: 20 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
                      <div style={{ color: '#94a3b8', marginTop: 6 }}>{card.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#111827', borderRadius: 20, border: '1px solid #334155', padding: 20 }}>
                  <h3 style={{ marginTop: 0 }}>Latest submissions</h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {links.slice(0, 6).map((link) => (
                      <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                          <img src={getPreviewUrl(link)} alt={link.title || 'link preview'} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 700 }}>{link.title || link.url}</div>
                            <div style={{ color: '#94a3b8', fontSize: 13 }}>{link.submitter_name || link.submitter_email || 'Unknown user'} • {link.platform}</div>
                          </div>
                        </div>
                        <span style={{ color: link.status === 'approved' ? '#34d399' : link.status === 'rejected' ? '#f87171' : '#f59e0b', fontSize: 13, textTransform: 'capitalize' }}>{link.status || 'pending'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'moderation' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: 28 }}>Moderation Engine</h1>
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search submissions or user" style={{ ...inputStyle, width: 260, maxWidth: '100%' }} />
                </div>
                <div style={{ background: '#111827', borderRadius: 20, border: '1px solid #334155', overflow: 'hidden' }}>
                  <div style={{ padding: 16, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong>Pending Submissions</strong>
                    <span style={{ color: '#f59e0b' }}>{pendingCount} waiting</span>
                  </div>
                  {visibleLinks.filter((link) => link.status === 'pending').length === 0 ? (
                    <div style={{ padding: 24, color: '#94a3b8' }}>No pending submissions.</div>
                  ) : (
                    <div style={{ display: 'grid' }}>
                      {visibleLinks.filter((link) => link.status === 'pending').map((link) => (
                        <div key={link.id} style={{ padding: 16, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 240 }}>
                            <img src={getPreviewUrl(link)} alt={link.title || 'preview'} style={{ width: 54, height: 54, borderRadius: 12, objectFit: 'cover' }} />
                            <div>
                              <div style={{ fontWeight: 700 }}>{link.title || link.url}</div>
                              <div style={{ color: '#94a3b8', fontSize: 13 }}>{link.platform} • {link.category}</div>
                              <div style={{ color: '#38bdf8', fontSize: 12, marginTop: 4 }}>{link.submitter_name || link.submitter_email || 'Unknown user'}{link.submitter_hint ? ` • ${link.submitter_hint}` : ''}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => approveLink(link.id)} style={{ ...smallButtonStyle, background: '#16a34a' }}>Approve</button>
                            <button onClick={() => rejectLink(link.id)} style={{ ...smallButtonStyle, background: '#dc2626' }}>Reject</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ background: '#111827', borderRadius: 20, border: '1px solid #334155', overflow: 'hidden' }}>
                  <div style={{ padding: 16, borderBottom: '1px solid #1e293b' }}>
                    <strong>Recent Decision History</strong>
                  </div>
                  <div style={{ display: 'grid' }}>
                    {visibleLinks.filter((link) => link.status && link.status !== 'pending').slice(0, 6).map((link) => (
                      <div key={link.id} style={{ padding: 16, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{link.title || link.url}</div>
                          <div style={{ color: '#94a3b8', fontSize: 13 }}>{link.submitter_email || 'Unknown user'}</div>
                        </div>
                        <span style={{ color: link.status === 'approved' ? '#34d399' : '#f87171', textTransform: 'capitalize' }}>{link.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <h1 style={{ margin: 0, fontSize: 28 }}>User Management Hub</h1>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email" style={{ ...inputStyle, width: 240 }} />
                    <select value={userFilter} onChange={(e) => setUserFilter(e.target.value as 'all' | 'admin' | 'user')} style={{ ...inputStyle, width: 140 }}>
                      <option value="all">All users</option>
                      <option value="admin">Admins</option>
                      <option value="user">Users</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  {[
                    { label: 'Total users', value: profiles.length, color: '#38bdf8' },
                    { label: 'Filtered results', value: filteredProfiles.length, color: '#a78bfa' },
                    { label: 'Pending reviews', value: pendingCount, color: '#f59e0b' },
                  ].map((card) => (
                    <div key={card.label} style={{ background: '#111827', borderRadius: 20, border: '1px solid #334155', padding: 20 }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
                      <div style={{ color: '#94a3b8', marginTop: 6 }}>{card.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#111827', borderRadius: 20, border: '1px solid #334155', overflow: 'hidden' }}>
                  <div style={{ padding: 16, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <strong>Registered Profiles</strong>
                    <span>{filteredProfiles.length} shown</span>
                  </div>
                  <div style={{ display: 'grid' }}>
                    {filteredProfiles.map((profile) => (
                      <div key={profile.id} style={{ padding: 16, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{profile.full_name || profile.email}</div>
                          <div style={{ color: '#94a3b8', fontSize: 13 }}>{profile.email}</div>
                          <div style={{ color: '#38bdf8', fontSize: 12, marginTop: 4, textTransform: 'capitalize' }}>{profile.role || 'user'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button onClick={() => viewUserSubmissions(profile)} style={{ ...smallButtonStyle, background: '#0f766e' }}>View submissions</button>
                          <button onClick={() => selectProfile(profile)} style={{ ...smallButtonStyle, background: '#2563eb' }}>Edit</button>
                          <button onClick={() => deleteProfile(profile)} style={{ ...smallButtonStyle, background: '#dc2626' }}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: '#111827', borderRadius: 20, border: '1px solid #334155', padding: 20, display: 'grid', gap: 12 }}>
                  <h3 style={{ margin: 0 }}>Edit Profile</h3>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Full Name</span>
                    <input value={profileName} onChange={(e) => setProfileName(e.target.value)} style={inputStyle} placeholder="Full name" />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Email</span>
                    <input value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} type="email" style={inputStyle} placeholder="user@example.com" />
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>Role</span>
                    <select value={profileRole} onChange={(e) => setProfileRole(e.target.value)} style={inputStyle}>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <label style={{ display: 'grid', gap: 6 }}>
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>New Password (optional)</span>
                    <input value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} type="password" style={inputStyle} placeholder="Leave blank to keep unchanged" />
                  </label>
                  <button onClick={saveProfile} disabled={savingProfile || !selectedProfileId} style={{ ...buttonStyle, opacity: savingProfile ? 0.8 : 1, width: 'fit-content' }}>
                    {savingProfile ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div style={{ display: 'grid', gap: 16 }}>
                <h1 style={{ margin: 0, fontSize: 28 }}>Category & Content Manager</h1>
                <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  <div style={{ background: '#111827', borderRadius: 20, border: '1px solid #334155', padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Dynamic Categories</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {Array.from(new Set(links.map((link) => link.category).filter(Boolean))).map((category) => (
                        <span key={category} style={{ background: '#1e293b', padding: '6px 10px', borderRadius: 999, fontSize: 12 }}>{category}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: '#111827', borderRadius: 20, border: '1px solid #334155', padding: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Security Guidelines</h3>
                    <p style={{ color: '#94a3b8', margin: 0 }}>Keep admin credentials in environment variables and never expose secrets in client-side code.</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  border: '1px solid #334155',
  borderRadius: 12,
  padding: '12px 14px',
  fontSize: 14,
  background: '#0f172a',
  color: '#f8fafc',
};

const buttonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 12,
  padding: '12px 16px',
  background: '#2563eb',
  color: 'white',
  fontWeight: 700,
  cursor: 'pointer',
};

const navButtonStyle: React.CSSProperties = {
  border: '1px solid #334155',
  borderRadius: 12,
  padding: '10px 12px',
  color: '#f8fafc',
  textAlign: 'left',
  cursor: 'pointer',
};

const smallButtonStyle: React.CSSProperties = {
  border: 'none',
  borderRadius: 10,
  padding: '8px 12px',
  color: 'white',
  cursor: 'pointer',
};
