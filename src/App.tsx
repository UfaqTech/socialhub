import React, { useState, useEffect, useMemo } from 'react';
import { 
  MessageCircle, 
  Send, 
  Facebook, 
  Search, 
  Moon, 
  Sun, 
  Bell, 
  Plus, 
  ChevronDown, 
  Bookmark, 
  Compass, 
  Check, 
  X, 
  Edit2, 
  Trash2, 
  LogOut, 
  LogIn, 
  Copy, 
  Info, 
  ExternalLink, 
  Shield, 
  Activity, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Mail, 
  GraduationCap, 
  Code2, 
  Laptop, 
  Laugh, 
  ShieldAlert, 
  Briefcase, 
  Clapperboard, 
  Newspaper,
  User,
  Heart,
  Sparkles,
  Smartphone,
  Menu
} from 'lucide-react';
// @ts-ignore
import utLogo from './logo/UT_social-hub.png';
import { socialHubApi } from './supabase';
import { SocialLink, Category, Profile, AuditLog } from './types';

const cleanImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  let clean = url.trim();
  // Auto-correct truncated WhatsApp CDN URLs ending in .jp to .jpg
  if (clean.includes('pps.whatsapp.net') && clean.endsWith('.jp')) {
    clean = clean + 'g';
  }
  return clean;
};

const getDisplayImageUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  let cleaned = url.trim();
  if (cleaned.includes('pps.whatsapp.net')) {
    if (cleaned.endsWith('.jp')) {
      cleaned = cleaned + 'g';
    }
    return `/api/proxy-image?url=${encodeURIComponent(cleaned)}`;
  }
  return cleaned;
};

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('socialhub_dark_mode');
    return saved ? saved === 'true' : true; // default dark mode for that premium look
  });

  // Routing state based on hash: '#/', '#/auth', '#/submit', '#/profile', '#/admin'
  const [currentHash, setCurrentHash] = useState<string>(() => window.location.hash || '#/');

  // Auth State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authEmail, setAuthEmail] = useState<string>('mawais03415942806@gmail.com');
  const [authPassword, setAuthPassword] = useState<string>('password123');
  const [authFullName, setAuthFullName] = useState<string>('Awaiss Mawais');
  const [isSignUpMode, setIsSignUpMode] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // App Database States
  const [categories, setCategories] = useState<Category[]>([]);
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [pendingLinks, setPendingLinks] = useState<SocialLink[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [dbLoading, setDbLoading] = useState<boolean>(false);

  // Home Feed Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('Latest');

  // Submit Form State
  const [submitPlatform, setSubmitPlatform] = useState<'WhatsApp' | 'Telegram' | 'Facebook'>('WhatsApp');
  const [submitSubType, setSubmitSubType] = useState<'Group' | 'Channel' | 'Page'>('Group');
  const [submitCategory, setSubmitCategory] = useState<string>('Entertainment');
  const [submitTitle, setSubmitTitle] = useState<string>('ONLY FRIENDS ZONE');
  const [submitDescription, setSubmitDescription] = useState<string>('A vibrant community for sharing updates, resources, and discussion.');
  const [submitUrl, setSubmitUrl] = useState<string>('');
  const [submitImageUrl, setSubmitImageUrl] = useState<string>('https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80');
  const [submitMemberCount, setSubmitMemberCount] = useState<number>(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState<boolean>(false);
  const [fetchSuccessMsg, setFetchSuccessMsg] = useState<string | null>(null);

  // Admin Edit Modal State
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  // Profile Edit State
  const [editFullName, setEditFullName] = useState<string>('');
  const [editBio, setEditBio] = useState<string>('');
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>('');
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // UI Utilities states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState<boolean>(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [supportMessage, setSupportMessage] = useState<string>('');
  const [supportSubject, setSupportSubject] = useState<string>('General Inquiry');
  const [supportSuccess, setSupportSuccess] = useState<boolean>(false);
  const [bellDropdownOpen, setBellDropdownOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(window.innerWidth >= 1024);

  // Helper to handle responsive navigation click
  const navigateTo = (hash: string) => {
    window.location.hash = hash;
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  // Check Hash router on load and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '#/');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update theme class on root
  useEffect(() => {
    localStorage.setItem('socialhub_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Load Initial Auth
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await socialHubApi.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          // Load bookmarks
          const savedBookmarks = await socialHubApi.getBookmarks(currentUser.id);
          setBookmarks(savedBookmarks);
          
          setEditFullName(currentUser.profile?.full_name || '');
          setEditBio(currentUser.profile?.bio || 'Passionate community organizer & explorer.');
          setEditAvatarUrl(currentUser.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');
        }
      } catch (err) {
        console.error('Auth check error', err);
      } finally {
        setAuthLoading(false);
      }
    };
    initAuth();
  }, []);

  // Sync / Load database items
  const loadDatabase = async () => {
    setDbLoading(true);
    try {
      const [cats, approved, pending, logs] = await Promise.all([
        socialHubApi.getCategories(),
        socialHubApi.getApprovedLinks(),
        socialHubApi.getPendingLinks(),
        socialHubApi.getAuditLogs()
      ]);
      setCategories(cats);
      setLinks(approved);
      setPendingLinks(pending);
      setAuditLogs(logs);
    } catch (e) {
      console.error('Error loading DB', e);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    loadDatabase();
  }, [user]);

  // Handle Authentication submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isSignUpMode) {
        const { user: newUser, error } = await socialHubApi.signUp(authEmail, authPassword, authFullName, rememberMe);
        if (error) {
          setAuthError(error.message || 'Failed to sign up');
        } else {
          setUser(newUser);
          showToast('Account created successfully!');
          window.location.hash = '#/';
        }
      } else {
        const { user: loggedInUser, error } = await socialHubApi.signIn(authEmail, authPassword, rememberMe);
        if (error) {
          setAuthError(error.message || 'Invalid email or password');
        } else {
          setUser(loggedInUser);
          showToast(`Welcome back, ${loggedInUser.profile?.full_name || 'User'}!`);
          window.location.hash = '#/';
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await socialHubApi.signOut();
    setUser(null);
    setBookmarks([]);
    showToast('Signed out successfully');
    window.location.hash = '#/';
  };

  // Show Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Bookmark Toggle
  const handleToggleBookmark = async (linkId: string) => {
    if (!user) {
      showToast('Please sign in to bookmark links!');
      window.location.hash = '#/auth';
      return;
    }
    const updated = await socialHubApi.toggleBookmark(user.id, linkId);
    setBookmarks(updated);
    if (updated.includes(linkId)) {
      showToast('Added to your Saved Bookmarks');
    } else {
      showToast('Removed from Saved Bookmarks');
    }
  };

  // Filter and Sort links
  const filteredLinks = useMemo(() => {
    let result = [...links];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(l => 
        l.title.toLowerCase().includes(query) || 
        (l.description && l.description.toLowerCase().includes(query)) ||
        l.category.toLowerCase().includes(query)
      );
    }

    // Platform filter
    if (selectedPlatform !== 'All') {
      result = result.filter(l => l.platform.toLowerCase() === selectedPlatform.toLowerCase());
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(l => l.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sorting
    if (sortBy === 'Latest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'Members: High to Low') {
      result.sort((a, b) => b.member_count - a.member_count);
    } else if (sortBy === 'Alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    return result;
  }, [links, searchQuery, selectedPlatform, selectedCategory, sortBy]);

  // Automatically Fetch and Parse Link Details (Accurate Title, Image, Description, etc.) via Server-Side API
  const handleFetchLinkDetails = async (urlToFetch?: string) => {
    const url = urlToFetch || submitUrl;
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch (_) {
      return;
    }

    const isSupported = url.includes('chat.whatsapp.com') || url.includes('t.me') || url.includes('telegram') || url.includes('facebook.com') || url.includes('fb.com') || url.includes('fb.me');
    if (!isSupported) return;

    setIsFetchingMetadata(true);
    setFetchSuccessMsg(null);
    setSubmitError(null);

    try {
      const response = await fetch(`/api/fetch-link-details?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error('Failed to auto-fetch details from URL.');
      }
      const data = await response.json();
      if (data && !data.error) {
        if (data.title) setSubmitTitle(data.title);
        if (data.description !== undefined) setSubmitDescription(data.description);
        if (data.image_url) setSubmitImageUrl(cleanImageUrl(data.image_url));
        if (data.platform) setSubmitPlatform(data.platform);
        if (data.sub_type) setSubmitSubType(data.sub_type);
        if (typeof data.member_count === 'number') setSubmitMemberCount(data.member_count);
        
        setFetchSuccessMsg('✨ Auto-filled community details!');
        showToast('Auto-fetched title, cover, and description!');
      }
    } catch (err: any) {
      console.error('Error fetching metadata:', err);
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // Submit Link Community
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!user) {
      showToast('Please sign in to submit community links');
      window.location.hash = '#/auth';
      return;
    }

    if (!submitTitle || !submitUrl) {
      setSubmitError('Title and Target URL are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        platform: submitPlatform,
        sub_type: submitSubType,
        category: submitCategory,
        title: submitTitle,
        description: submitDescription,
        url: submitUrl,
        image_url: submitImageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        member_count: submitMemberCount || 0
      };

      const { data, error } = await socialHubApi.submitLink(payload, user.id);
      if (error) {
        setSubmitError(error.message || 'Submission failed. Ensure URL is unique.');
      } else {
        setIsSubmitModalOpen(true);
        // Clear inputs except defaults
        setSubmitUrl('');
        setSubmitMemberCount(0);
        loadDatabase();
      }
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit Link (User own link or Admin modifying field)
  const handleSaveEditLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLink) return;

    try {
      const { data, error } = await socialHubApi.updateLink(editingLink.id, {
        title: editingLink.title,
        description: editingLink.description,
        platform: editingLink.platform,
        sub_type: editingLink.sub_type,
        category: editingLink.category,
        url: editingLink.url,
        image_url: editingLink.image_url,
        member_count: editingLink.member_count
      });

      if (error) {
        showToast(`Failed to update link: ${error.message}`);
      } else {
        showToast('Link details updated successfully');
        setIsAdminModalOpen(false);
        setEditingLink(null);
        
        // Add audit log if editor is admin
        if (user && user.profile?.role === 'admin') {
          await socialHubApi.addAuditLog(
            'Updated Link Fields', 
            editingLink.id, 
            editingLink.title, 
            user.profile?.full_name || 'Admin'
          );
        }
        loadDatabase();
      }
    } catch (err: any) {
      showToast(`Error updating: ${err.message}`);
    }
  };

  // Delete Link
  const handleDeleteLink = async (linkId: string, linkTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${linkTitle}"?`)) {
      return;
    }

    try {
      const { error } = await socialHubApi.deleteLink(linkId);
      if (error) {
        showToast(`Failed to delete link: ${error.message}`);
      } else {
        showToast('Community link deleted successfully');
        if (user && user.profile?.role === 'admin') {
          await socialHubApi.addAuditLog(
            'Deleted Link', 
            linkId, 
            linkTitle, 
            user.profile?.full_name || 'Admin'
          );
        }
        loadDatabase();
      }
    } catch (err: any) {
      showToast(`Error deleting: ${err.message}`);
    }
  };

  // Quick Action Approve Link
  const handleApproveLink = async (link: SocialLink) => {
    try {
      const { error } = await socialHubApi.updateLinkStatus(link.id, 'approved');
      if (error) {
        showToast(`Failed to approve: ${error.message}`);
      } else {
        showToast(`Approved "${link.title}" successfully`);
        await socialHubApi.addAuditLog(
          'Approved Link', 
          link.id, 
          link.title, 
          user?.profile?.full_name || 'Admin'
        );
        loadDatabase();
      }
    } catch (e: any) {
      showToast(`Error approving: ${e.message}`);
    }
  };

  // Quick Action Reject Link
  const handleRejectLink = async (link: SocialLink) => {
    try {
      const { error } = await socialHubApi.updateLinkStatus(link.id, 'rejected');
      if (error) {
        showToast(`Failed to reject: ${error.message}`);
      } else {
        showToast(`Rejected "${link.title}" successfully`);
        await socialHubApi.addAuditLog(
          'Rejected Link', 
          link.id, 
          link.title, 
          user?.profile?.full_name || 'Admin'
        );
        loadDatabase();
      }
    } catch (e: any) {
      showToast(`Error rejecting: ${e.message}`);
    }
  };

  // Save profile changes
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileSuccessMsg(null);
    try {
      const { data, error } = await socialHubApi.updateProfileBio(user.id, editFullName, editBio, editAvatarUrl);
      if (error) {
        showToast(`Error updating profile: ${error.message}`);
      } else {
        setProfileSuccessMsg('Profile bio & details updated successfully!');
        // Update user state
        setUser({
          ...user,
          profile: {
            ...user.profile,
            full_name: editFullName,
            avatar_url: editAvatarUrl,
            bio: editBio
          }
        });
        showToast('Bio updated');
        setIsEditingProfile(false);
      }
    } catch (err: any) {
      showToast(`Error: ${err.message}`);
    }
  };

  // Invite Copy Share Link
  const handleInviteShare = () => {
    const shareUrl = window.location.origin + window.location.pathname;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId('invite-link');
    showToast('App link copied to clipboard! Share with your community.');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Support Submission Mock
  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage) return;
    setSupportSuccess(true);
    setTimeout(() => {
      setSupportSuccess(false);
      setSupportMessage('');
      setIsSupportModalOpen(false);
      showToast('Support ticket sent! Our team will reply shortly.');
    }, 1500);
  };

  // Helper platform styling
  const getPlatformColors = (platform: string) => {
    switch (platform) {
      case 'WhatsApp':
        return {
          bg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          accent: '#25D366',
          text: 'text-emerald-500',
          btnBg: 'bg-[#25D366] hover:bg-[#20ba59]',
          border: 'border-emerald-500'
        };
      case 'Telegram':
        return {
          bg: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
          accent: '#0088cc',
          text: 'text-sky-500',
          btnBg: 'bg-[#0088cc] hover:bg-[#0077b3]',
          border: 'border-sky-500'
        };
      case 'Facebook':
        return {
          bg: 'bg-blue-600/10 text-blue-600 border-blue-600/20',
          accent: '#1877F2',
          text: 'text-blue-600',
          btnBg: 'bg-[#1877F2] hover:bg-[#1569d6]',
          border: 'border-blue-600'
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
          accent: '#64748b',
          text: 'text-slate-500',
          btnBg: 'bg-slate-700 hover:bg-slate-600',
          border: 'border-slate-500'
        };
    }
  };

  const getCategoryIcon = (catName: string) => {
    switch (catName) {
      case 'Educational': return <GraduationCap className="w-4 h-4" />;
      case 'Programming': return <Code2 className="w-4 h-4" />;
      case 'Tech': return <Laptop className="w-4 h-4" />;
      case 'Funny': return <Laugh className="w-4 h-4" />;
      case '18+': return <ShieldAlert className="w-4 h-4" />;
      case 'Business': return <Briefcase className="w-4 h-4" />;
      case 'Entertainment': return <Clapperboard className="w-4 h-4" />;
      case 'News': return <Newspaper className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

  // Helper Preset Images to make submit preview simple & beautiful
  const presetCoverImages = [
    { label: 'Green Tech Waves', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80' },
    { label: 'Minimal Workspace', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
    { label: 'Cyber Network', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80' },
    { label: 'Cozy Friends Gathering', url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80' },
    { label: 'Business Growth Chart', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Entertainment Popcorn', url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80' }
  ];

  return (
    <div id="app-root" className={`min-h-screen font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div id="toast-notification" className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl animate-bounce">
          <Check className="w-5 h-5" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header id="main-header" className={`sticky top-0 z-40 border-b transition-colors ${
        isDarkMode ? 'bg-slate-900/90 border-slate-800/80' : 'bg-white/90 border-slate-200'
      } backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo Brand & Sidebar Toggle */}
          <div className="flex items-center gap-3">
            <button
              id="sidebar-toggle-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-xl transition-colors flex items-center justify-center border ${
                isDarkMode 
                  ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center cursor-pointer animate-fade-in" onClick={() => navigateTo('#/')}>
              <img src={utLogo} alt="UT Social Hub" className="h-11 w-auto object-contain" />
            </div>
          </div>

          {/* Center Search bar */}
          <div className="flex-1 max-w-lg hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                id="header-search"
                type="text"
                placeholder="Search groups, channels, pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 text-sm rounded-full outline-none border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800/50 border-slate-700/60 focus:bg-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-white' 
                    : 'bg-slate-100 border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-slate-800'
                }`}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-3">
            
            {/* Sort Select */}
            <div className="relative hidden md:block">
              <select
                id="header-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`text-xs pl-3 pr-8 py-2 rounded-lg outline-none appearance-none border transition-all ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-emerald-500' 
                    : 'bg-white border-slate-300 text-slate-700 focus:border-emerald-500'
                }`}
              >
                <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Latest">Latest Additions</option>
                <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Members: High to Low">Popularity (Size)</option>
                <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Alphabetical">Alphabetical (A-Z)</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Light/Dark mode */}
            <button 
              id="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              title="Toggle theme"
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-900" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                id="notification-bell"
                onClick={() => setBellDropdownOpen(!bellDropdownOpen)}
                className={`p-2 rounded-lg relative transition-colors ${
                  isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>

              {bellDropdownOpen && (
                <div id="notification-dropdown" className={`absolute right-0 mt-2 w-80 rounded-xl shadow-2xl border p-4 z-50 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 mb-3">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-400">System Activity</span>
                    <button onClick={() => setBellDropdownOpen(false)} className="text-slate-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    <div className="text-xs p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="font-semibold text-emerald-400">Welcome to SocialHub Companion</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Explore high-fidelity links, save bookmarks, or submit your own groups & channels!</p>
                      <span className="text-[9px] text-slate-500 mt-1 block">Just Now</span>
                    </div>
                    {pendingLinks.length > 0 && user?.profile?.role === 'admin' && (
                      <div className="text-xs p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <p className="font-semibold text-amber-400">Pending Actions Required</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">There are {pendingLinks.length} new communities in the approval queue.</p>
                        <button 
                          onClick={() => { setBellDropdownOpen(false); window.location.hash = '#/admin'; }}
                          className="text-[10px] text-amber-400 underline font-semibold mt-1 block"
                        >
                          Review Queue
                        </button>
                      </div>
                    )}
                    {auditLogs.slice(0, 2).map((log) => (
                      <div key={log.id} className="text-xs p-2 rounded-lg bg-slate-800/40 border border-slate-700/30">
                        <p className="text-slate-300"><span className="font-semibold">{log.admin_name}</span>: {log.action}</p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">Target: {log.target_title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Auth / Profile Quick Button */}
            {user ? (
              <button 
                id="header-profile-btn"
                onClick={() => window.location.hash = '#/profile'}
                className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-800 text-left transition-colors border border-slate-800"
              >
                <img 
                  src={user.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                  alt={user.profile?.full_name} 
                  className="w-7 h-7 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                  }}
                />
                <div className="hidden lg:block text-xs">
                  <p className="font-semibold text-slate-300 leading-tight truncate max-w-[80px]">
                    {user.profile?.full_name || 'UfaqTechian'}
                  </p>
                  <p className="text-[9px] text-emerald-400 font-mono capitalize leading-tight">
                    {user.profile?.role || 'User'}
                  </p>
                </div>
              </button>
            ) : (
              <button 
                id="header-login-btn"
                onClick={() => window.location.hash = '#/auth'}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-2 rounded-lg transition-all font-semibold shadow-md shadow-emerald-500/10"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Join Hub</span>
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Mobile Sidebar Slide-over Drawer Backdrop */}
          {isSidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 transition-opacity duration-300"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* LEFT SIDEBAR (Sticky Navigation Rail) */}
          <aside 
            id="left-navigation-sidebar" 
            className={`
              ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0 lg:hidden'}
              fixed inset-y-0 left-0 w-72 lg:w-auto lg:static lg:translate-x-0 lg:opacity-100
              z-50 lg:z-0 p-6 lg:p-0
              ${isDarkMode ? 'bg-slate-900 border-r border-slate-800' : 'bg-white border-r border-slate-200 lg:border-r-0'}
              lg:bg-transparent
              transition-all duration-300 ease-in-out
              lg:col-span-3 space-y-6 overflow-y-auto lg:overflow-visible
            `}
          >
            {/* Mobile drawer header */}
            <div className="flex items-center justify-between lg:hidden pb-4 border-b border-slate-800/60 mb-4">
              <div className="flex items-center gap-2">
                <img src={utLogo} alt="UT Social Hub" className="h-8 w-auto" />
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className={`p-1.5 rounded-lg border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Quick Profile Bio Card */}
            {user && (
              <div className={`p-4 rounded-2xl border transition-all ${
                isDarkMode ? 'bg-slate-900 border-slate-800/80' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center gap-3">
                  <img 
                    src={user.profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                    alt="Profile Avatar" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-sm leading-tight text-emerald-400">{user.profile?.full_name}</h4>
                    <p className="text-xs text-slate-400 leading-tight mt-0.5">{user.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
                      {user.profile?.role} MEMBER
                    </span>
                  </div>
                </div>
                
                {/* Micro Stats Row */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-800/60 text-center">
                  <div>
                    <span className="block text-xs font-bold text-emerald-400 font-mono">
                      {links.filter(l => l.user_id === user.id).length}
                    </span>
                    <span className="text-[10px] text-slate-400">Shared</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-sky-400 font-mono">
                      {bookmarks.length}
                    </span>
                    <span className="text-[10px] text-slate-400">Saved</span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-amber-400 font-mono">
                      {pendingLinks.filter(l => l.user_id === user.id).length}
                    </span>
                    <span className="text-[10px] text-slate-400">Pending</span>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Navigation Options */}
            <div className={`rounded-2xl border overflow-hidden transition-all ${
              isDarkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-200'
            }`}>
              <div className="p-3 border-b border-slate-800/60">
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold px-2">
                  Navigation Desk
                </span>
              </div>
              <nav className="p-2 space-y-1">
                
                <button 
                  onClick={() => navigateTo('#/')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentHash === '#/' 
                      ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 border border-emerald-500/20' 
                      : isDarkMode ? 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4" />
                    <span>Community Explorer</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {links.length}
                  </span>
                </button>

                <button 
                  onClick={() => {
                    if (!user) {
                      showToast('Please sign in to view your dashboard');
                      navigateTo('#/auth');
                    } else {
                      navigateTo('#/profile');
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentHash === '#/profile' 
                      ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 border border-emerald-500/20' 
                      : isDarkMode ? 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>My Dashboard</span>
                </button>

                <button 
                  onClick={() => {
                    if (!user) {
                      showToast('Please sign in to submit community links');
                      navigateTo('#/auth');
                    } else {
                      navigateTo('#/submit');
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    currentHash === '#/submit' 
                      ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 border border-emerald-500/20' 
                      : isDarkMode ? 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Submit Community</span>
                </button>

                {/* Secure Admin Tab Indicator */}
                {(user?.profile?.role === 'admin' || !socialHubApi.isUsingRealSupabase) && (
                  <button 
                    onClick={() => navigateTo('#/admin')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      currentHash === '#/admin' 
                        ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 text-amber-400 border border-amber-500/20' 
                        : isDarkMode ? 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-amber-400">Admin Panel</span>
                    </div>
                    {pendingLinks.length > 0 && (
                      <span className="text-[10px] font-mono font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded animate-pulse">
                        {pendingLinks.length}
                      </span>
                    )}
                  </button>
                )}

                <div className="h-px bg-slate-800/60 my-2"></div>

                {/* Additional Utilities from Android App Design */}
                <button 
                  onClick={() => { setIsRulesModalOpen(true); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all text-left"
                >
                  <Info className="w-4 h-4" />
                  <span>Community Rules</span>
                </button>

                <button 
                  onClick={() => { setIsSupportModalOpen(true); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all text-left"
                >
                  <Mail className="w-4 h-4" />
                  <span>Team Support Desk</span>
                </button>

                <button 
                  onClick={() => { handleInviteShare(); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <Send className="w-4 h-4" />
                    <span>Invite Network</span>
                  </div>
                  {copiedId === 'invite-link' ? (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">Copied</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 opacity-60" />
                  )}
                </button>

                {user && (
                  <button 
                    onClick={() => { handleSignOut(); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-all text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout Profile</span>
                  </button>
                )}

              </nav>
            </div>

            {/* Sandbox Quick Hack Helper for Developers */}
            {!socialHubApi.isUsingRealSupabase && (
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Activity className="w-4 h-4" />
                  <span>Local Sandbox Controls</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  As there is no external DB yet, you are logged in as standard user. You can switch roles below to easily test administrative operations:
                </p>
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => {
                      if (user) {
                        setUser({ ...user, profile: { ...user.profile, role: 'admin' } });
                        showToast('Role switched to ADMIN');
                      } else {
                        showToast('Please Sign In with sandbox account first');
                        navigateTo('#/auth');
                      }
                    }}
                    className="flex-1 py-1 px-2 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-all font-semibold font-mono text-[10px]"
                  >
                    Set Admin Role
                  </button>
                  <button 
                    onClick={() => {
                      if (user) {
                        setUser({ ...user, profile: { ...user.profile, role: 'user' } });
                        showToast('Role switched to USER');
                      } else {
                        showToast('Please Sign In with sandbox account first');
                        navigateTo('#/auth');
                      }
                    }}
                    className="flex-1 py-1 px-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all font-semibold font-mono text-[10px]"
                  >
                    Set User Role
                  </button>
                </div>
              </div>
            )}

          </aside>

          {/* MAIN PAGE AREA WITH VIEWS */}
          <main className={`${isSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'} space-y-6 transition-all duration-300`}>

            {/* ROUTE VIEW 1: HOME FEED (COMMUNITY EXPLORER) */}
            {currentHash === '#/' && (
              <div className="space-y-6">
                
                {/* Hero Section & Search Container */}
                <div className={`p-6 rounded-3xl border relative overflow-hidden ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800' 
                    : 'bg-gradient-to-br from-emerald-50/40 via-sky-50/20 to-white border-slate-200'
                }`}>
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <Smartphone className="w-64 h-64 text-emerald-400" />
                  </div>
                  
                  <div className="relative z-10 max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Android App Companion Edition</span>
                    </div>
                    
                    <h2 className="text-3xl font-extrabold tracking-tight">
                      Find & Join the Best <span className="text-emerald-400">Social Communities</span>
                    </h2>
                    
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Instantly explore high-fidelity WhatsApp Groups, Telegram Channels, and Facebook Pages. Add your own custom invitation links to reach thousands of global members!
                    </p>

                    {/* Integrated Mobile Search Bar inside Hero */}
                    <div className="block sm:hidden relative mt-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search groups or channels..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-9 pr-4 py-2 text-sm rounded-xl outline-none border ${
                          isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* FILTER CONTROLS: Platform filters & Horizontally scrollable Category lists */}
                <div className="space-y-4">
                  
                  {/* Platform Filter chips & Sort Select (visible on mobile here) */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-slate-400 mr-1 uppercase">Platform:</span>
                      {['All', 'WhatsApp', 'Telegram', 'Facebook'].map((plat) => {
                        const colors = getPlatformColors(plat);
                        const isSelected = selectedPlatform.toLowerCase() === plat.toLowerCase();
                        return (
                          <button
                            key={plat}
                            onClick={() => setSelectedPlatform(plat)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                              isSelected 
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                                : isDarkMode ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {plat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Mobile Sort Dropdown */}
                    <div className="relative block md:hidden w-full sm:w-auto">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={`w-full text-xs pl-3 pr-8 py-2 rounded-lg outline-none appearance-none border transition-all ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-emerald-500' 
                            : 'bg-white border-slate-300 text-slate-700 focus:border-emerald-500'
                        }`}
                      >
                        <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Latest">Latest Additions</option>
                        <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Members: High to Low">Popularity (Size)</option>
                        <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Alphabetical">Alphabetical (A-Z)</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                  </div>

                  {/* Horizontally scrolling Category badge capsules */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 pr-4 pt-1 scrollbar-thin">
                    <span className="text-xs font-mono text-slate-400 mr-2 uppercase shrink-0">Verticals:</span>
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                        selectedCategory === 'All'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isDarkMode ? 'bg-slate-900 text-slate-400 hover:text-slate-200' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>All Categories</span>
                    </button>
                    {categories.map((cat) => {
                      const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.name)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : isDarkMode ? 'bg-slate-900/60 text-slate-400 hover:text-slate-200' : 'bg-slate-200/80 text-slate-600'
                          }`}
                        >
                          {getCategoryIcon(cat.name)}
                          <span>{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* FEED CARDS GRID */}
                {dbLoading ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-slate-400 font-mono">Synchronizing communities...</p>
                  </div>
                ) : filteredLinks.length === 0 ? (
                  <div className={`p-12 text-center rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <h3 className="font-bold text-lg">No Approved Communities Found</h3>
                    <p className="text-sm text-slate-400 max-w-md mx-auto mt-1">
                      No groups match the filters or search keywords. Try shifting the categories, changing the platforms, or submit your own!
                    </p>
                    <button 
                      onClick={() => window.location.hash = '#/submit'}
                      className="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Yours First</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLinks.map((link) => {
                      const colors = getPlatformColors(link.platform);
                      const isSaved = bookmarks.includes(link.id);
                      return (
                        <div 
                          key={link.id}
                          className={`rounded-2xl overflow-hidden border group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                            isDarkMode 
                              ? 'bg-slate-900 border-slate-800/80 hover:border-slate-700/80 hover:shadow-slate-950/50' 
                              : 'bg-white border-slate-200 hover:shadow-slate-200/50'
                          }`}
                        >
                          {/* Card Image banner */}
                          <div className="relative h-44 overflow-hidden bg-slate-800">
                            <img 
                              src={getDisplayImageUrl(link.image_url) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} 
                              alt={link.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = link.platform === 'WhatsApp' 
                                  ? 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80'
                                  : link.platform === 'Telegram'
                                    ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
                                    : 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                            
                            {/* Saved Bookmark Toggle badge */}
                            <button 
                              onClick={() => handleToggleBookmark(link.id)}
                              className="absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md bg-slate-900/60 hover:bg-slate-900 text-white transition-all shadow-md"
                              title={isSaved ? 'Remove Bookmark' : 'Save Bookmark'}
                            >
                              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-emerald-400 text-emerald-400' : 'text-slate-300'}`} />
                            </button>

                            {/* SubType tag overlay */}
                            <div className="absolute bottom-3 left-3 flex items-center gap-2">
                              <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase flex items-center gap-1 backdrop-blur-md bg-slate-900/85 border ${colors.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full`} style={{ backgroundColor: colors.accent }}></span>
                                <span>{link.sub_type}</span>
                              </span>
                              <span className="text-[10px] bg-slate-900/80 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md">
                                {link.category}
                              </span>
                            </div>
                          </div>

                          {/* Card details body */}
                          <div className="p-5 space-y-4">
                            
                            <div className="space-y-1.5">
                              <h3 className="font-bold text-base leading-tight tracking-tight group-hover:text-emerald-400 transition-colors line-clamp-1">
                                {link.title}
                              </h3>
                              <p className="text-xs text-slate-400 line-clamp-2 h-8 leading-relaxed">
                                {link.description || 'No custom description provided for this community platform invitation.'}
                              </p>
                            </div>

                            {/* Member Count Badge & Brand indicator */}
                            <div className="flex items-center justify-between pt-1">
                              
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-slate-400 font-mono">Platform:</span>
                                <span className={`font-semibold ${colors.text}`}>{link.platform}</span>
                              </div>

                              {/* Exact specification badge: Background #E0F2FE, Text #0369A1, Bold */}
                              {link.member_count > 0 ? (
                                <div className="bg-[#E0F2FE] text-[#0369A1] font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                                  {link.member_count.toLocaleString()} Members
                                </div>
                              ) : (
                                <div className="bg-slate-800 text-slate-400 text-[9px] px-2.5 py-1 rounded-full uppercase font-mono">
                                  No Count Listed
                                </div>
                              )}

                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-5 gap-2 pt-1.5">
                              <a 
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`col-span-3 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md ${colors.btnBg}`}
                              >
                                <span>Join Now</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <button 
                                onClick={() => {
                                  showToast('Community reported to admins for inspection.');
                                }}
                                className={`col-span-2 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                                  isDarkMode 
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' 
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                              >
                                Report
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}


            {/* ROUTE VIEW 2: AUTH PAGE */}
            {currentHash === '#/auth' && (
              <div className="max-w-md mx-auto py-10">
                <div className={`p-8 rounded-3xl border shadow-2xl space-y-6 ${
                  isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                      <Smartphone className="w-6.5 h-6.5" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {isSignUpMode ? 'Create Hub Account' : 'Sign In to SocialHub'}
                    </h2>
                    <p className="text-xs text-slate-400">
                      {isSignUpMode 
                        ? 'Join our premium group directory system' 
                        : 'Manage your submitted communities & saved networks'}
                    </p>
                  </div>

                  {authError && (
                    <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {isSignUpMode && (
                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                        <input 
                          type="text"
                          required
                          placeholder="Your real name"
                          value={authFullName}
                          onChange={(e) => setAuthFullName(e.target.value)}
                          className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                            isDarkMode 
                              ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                              : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                          }`}
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
                      <input 
                        type="email"
                        required
                        placeholder="you@domain.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                          isDarkMode 
                            ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                            : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
                      <input 
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                          isDarkMode 
                            ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                            : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                        }`}
                      />
                    </div>

                    {/* Remember me toggle */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 bg-slate-800"
                        />
                        <span>Remember Me</span>
                      </label>
                      <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">Forgot Password?</span>
                    </div>

                    <button 
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
                    >
                      {authLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <span>{isSignUpMode ? 'Create Free Account' : 'Authenticate Into Workspace'}</span>
                      )}
                    </button>
                  </form>

                  <div className="h-px bg-slate-800"></div>

                  <div className="text-center text-xs text-slate-400">
                    <span>{isSignUpMode ? 'Already have an account?' : "Don't have an account?"}</span>{' '}
                    <button 
                      onClick={() => setIsSignUpMode(!isSignUpMode)}
                      className="text-emerald-400 font-bold hover:underline"
                    >
                      {isSignUpMode ? 'Sign In' : 'Sign Up Free'}
                    </button>
                  </div>

                </div>
              </div>
            )}


            {/* ROUTE VIEW 3: SUBMIT COMMUNITY FORM WITH REAL-TIME LIVE PREVIEW */}
            {currentHash === '#/submit' && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Submit Your Social Invitation Link</h2>
                    <p className="text-xs text-slate-400">Fill in details on the left, check the live preview rendering on the right!</p>
                  </div>
                  <button 
                    onClick={() => window.location.hash = '#/'}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Back to Feed
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  
                  {/* Form fields col */}
                  <form onSubmit={handleLinkSubmit} className="xl:col-span-7 space-y-4">
                    
                    {submitError && (
                      <div className="p-3 text-xs rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-2">
                        <AlertCircle className="w-4.5 h-4.5" />
                        <span>{submitError}</span>
                      </div>
                    )}

                    <div className={`p-6 rounded-2xl border space-y-4 ${
                      isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      
                      {/* Platform & SubType selector */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Select Platform</label>
                          <select
                            value={submitPlatform}
                            onChange={(e) => {
                              const plat = e.target.value as any;
                              setSubmitPlatform(plat);
                              // change default preseed cover depending on platform
                              if (plat === 'WhatsApp') {
                                setSubmitImageUrl('https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80');
                              } else if (plat === 'Telegram') {
                                setSubmitImageUrl('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80');
                              } else {
                                setSubmitImageUrl('https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80');
                              }
                            }}
                            className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                              isDarkMode 
                                ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                                : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                            }`}
                          >
                            <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="WhatsApp">WhatsApp</option>
                            <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Telegram">Telegram</option>
                            <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Facebook">Facebook</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Sub-Type</label>
                          <select
                            value={submitSubType}
                            onChange={(e) => setSubmitSubType(e.target.value as any)}
                            className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                              isDarkMode 
                                ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                                : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                            }`}
                          >
                            <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Group">Group Chat</option>
                            <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Channel">Broadcast Channel</option>
                            <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Page">Social Fan Page / Profile</option>
                          </select>
                        </div>
                      </div>

                      {/* Category select */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Vertical Category</label>
                        <select
                          value={submitCategory}
                          onChange={(e) => setSubmitCategory(e.target.value)}
                          className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                            isDarkMode 
                              ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                              : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                          }`}
                        >
                          {categories.map((cat) => (
                            <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Title input */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Link Title</label>
                        <input 
                          type="text"
                          required
                          placeholder="e.g. ONLY FRIENDS ZONE"
                          value={submitTitle}
                          onChange={(e) => setSubmitTitle(e.target.value)}
                          className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                            isDarkMode 
                              ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                              : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                          }`}
                        />
                      </div>

                      {/* Target Invitation URL with AI Auto-Fill */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Target Invitation URL</label>
                          <button
                            type="button"
                            disabled={isFetchingMetadata || !submitUrl}
                            onClick={() => handleFetchLinkDetails()}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all ${
                              isFetchingMetadata 
                                ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                                : submitUrl 
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-md'
                                  : 'bg-slate-800/40 border-slate-700/50 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isFetchingMetadata ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                <span>Analyzing Link...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                                <span>Auto-Fill Info</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        <div className="relative">
                          <input 
                            type="url"
                            required
                            placeholder="https://chat.whatsapp.com/... or https://t.me/..."
                            value={submitUrl}
                            onChange={(e) => setSubmitUrl(e.target.value)}
                            onBlur={() => handleFetchLinkDetails()}
                            onPaste={(e) => {
                              const pastedText = e.clipboardData.getData('text');
                              if (pastedText) {
                                handleFetchLinkDetails(pastedText);
                              }
                            }}
                            className={`w-full pl-4 pr-10 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                              isDarkMode 
                                ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                                : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                            } ${isFetchingMetadata ? 'opacity-80 border-dashed animate-pulse' : ''}`}
                          />
                          {isFetchingMetadata && (
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>

                        {/* Status messages / Feedback */}
                        {isFetchingMetadata && (
                          <div className="text-[11px] text-emerald-400/90 font-mono animate-pulse flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span>Scanning link and extracting group details instantly...</span>
                          </div>
                        )}

                        {fetchSuccessMsg && !isFetchingMetadata && (
                          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 animate-fade-in">
                            <Check className="w-3.5 h-3.5" />
                            <span>{fetchSuccessMsg}</span>
                          </div>
                        )}

                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          Tip: Paste your WhatsApp, Telegram, or Facebook URL. The form will automatically fetch title, image cover, and description if public!
                        </p>
                      </div>

                      {/* Cover Image Presets / URL */}
                      <div className="space-y-2">
                        <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Cover Image URL</label>
                        <input 
                          type="text"
                          placeholder="Paste image URL..."
                          value={submitImageUrl}
                          onChange={(e) => setSubmitImageUrl(cleanImageUrl(e.target.value))}
                          className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                            isDarkMode 
                              ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                              : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                          }`}
                        />
                        
                        {/* Interactive Preset Chips */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-400 font-mono block">Preset Options (Click to apply):</span>
                          <div className="flex flex-wrap gap-1.5">
                            {presetCoverImages.map((img) => (
                              <button
                                key={img.label}
                                type="button"
                                onClick={() => setSubmitImageUrl(img.url)}
                                className={`text-[10px] px-2 py-1 rounded border transition-all ${
                                  submitImageUrl === img.url 
                                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-semibold' 
                                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                {img.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {submitPlatform === 'WhatsApp' && (
                          <div className={`mt-2.5 p-3 rounded-xl border text-[11px] leading-relaxed space-y-1.5 ${
                            isDarkMode 
                              ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-300/90' 
                              : 'bg-emerald-50/50 border-emerald-500/20 text-emerald-800'
                          }`}>
                            <div className="font-semibold flex items-center gap-1 text-emerald-400">
                              <span className="text-xs">💡</span>
                              <span>How to show your REAL Group Profile Photo:</span>
                            </div>
                            <div className="opacity-90 pl-4 space-y-0.5 text-left">
                              <div>1. Go to <strong>WhatsApp Web</strong> or <strong>WhatsApp Desktop</strong>.</div>
                              <div>2. Right-click the group's profile photo and select <strong>"Copy image address"</strong>.</div>
                              <div>3. Paste that complete URL (including security parameters like <code className="bg-emerald-500/10 px-1 rounded font-mono font-bold">_nc_cat</code>) above. Our secure server proxy will load it flawlessly!</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Description Area */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Short Description</label>
                        <textarea
                          rows={3}
                          placeholder="A vibrant community for sharing updates, resources, and discussion."
                          value={submitDescription}
                          onChange={(e) => setSubmitDescription(e.target.value)}
                          className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                            isDarkMode 
                              ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                              : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                          }`}
                        ></textarea>
                      </div>

                      {/* Numeric Member count */}
                      <div className="space-y-1.5">
                        <label className={`text-xs font-semibold block ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Member Count / Size (Numeric Only)</label>
                        <input 
                          type="number"
                          min="0"
                          placeholder="e.g. 250"
                          value={submitMemberCount}
                          onChange={(e) => setSubmitMemberCount(parseInt(e.target.value) || 0)}
                          className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                            isDarkMode 
                              ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                              : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                          }`}
                        />
                      </div>

                      {/* Submit Trigger */}
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/15"
                      >
                        {isSubmitting ? 'Registering Link...' : 'Submit to Admin Queue'}
                      </button>

                    </div>
                  </form>

                  {/* Real-time Side-By-Side Preview Mockup on the right */}
                  <div className="xl:col-span-5 space-y-4">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block font-bold">
                      Interactive Real-time Preview
                    </span>
                    
                    <div className="sticky top-24">
                      {(() => {
                        const colors = getPlatformColors(submitPlatform);
                        return (
                          <div className={`rounded-2xl overflow-hidden border shadow-2xl transition-all duration-300 ${
                            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                          }`}>
                            <div className="p-3 text-center text-[10px] font-mono text-emerald-400 bg-emerald-500/5 border-b border-slate-800">
                              ▲ LIVE PREVIEW CONTAINER ▲
                            </div>

                            {/* Cover banner */}
                            <div className="relative h-48 bg-slate-800">
                              <img 
                                src={getDisplayImageUrl(submitImageUrl) || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'} 
                                alt="Cover preview"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = submitPlatform === 'WhatsApp' 
                                    ? 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80'
                                    : submitPlatform === 'Telegram'
                                      ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
                                      : 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                              
                              <div className="absolute top-3 right-3 p-2 rounded-xl bg-slate-950/70 text-slate-300">
                                <Bookmark className="w-4 h-4" />
                              </div>

                              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <span className={`text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-md uppercase flex items-center gap-1 bg-slate-950/80 border ${colors.bg}`}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.accent }}></span>
                                  <span>{submitSubType}</span>
                                </span>
                                <span className="text-[10px] bg-slate-950/80 border border-slate-700/60 text-slate-300 px-2 py-0.5 rounded-md">
                                  {submitCategory}
                                </span>
                              </div>
                            </div>

                            {/* Details preview */}
                            <div className="p-5 space-y-4">
                              <div className="space-y-1.5">
                                <h3 className="font-extrabold text-lg leading-tight truncate">
                                  {submitTitle || 'Untitled Community'}
                                </h3>
                                <p className="text-xs text-slate-400 line-clamp-3 h-12 leading-relaxed">
                                  {submitDescription || 'A vibrant community for sharing updates, resources, and discussion.'}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="text-slate-400 font-mono">Platform:</span>
                                  <span className={`font-bold ${colors.text}`}>{submitPlatform}</span>
                                </div>

                                {/* Exact Members badge format: Bg #E0F2FE, Text #0369A1, ExtraBold */}
                                {submitMemberCount > 0 ? (
                                  <div className="bg-[#E0F2FE] text-[#0369A1] font-extrabold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider font-mono">
                                    {submitMemberCount.toLocaleString()} Members
                                  </div>
                                ) : (
                                  <div className="bg-slate-800 text-slate-400 text-[9px] px-2.5 py-1 rounded-full uppercase font-mono">
                                    No Count Listed
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-5 gap-2 pt-2">
                                <button 
                                  type="button"
                                  className={`col-span-3 py-2.5 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-1.5 shadow-lg ${colors.btnBg}`}
                                >
                                  <span>Join Now</span>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  type="button"
                                  className="col-span-2 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 text-center"
                                >
                                  Report
                                </button>
                              </div>
                            </div>

                          </div>
                        );
                      })()}

                      {/* Guidelines Tip card */}
                      <div className="mt-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                        <p className="font-semibold text-slate-300">💡 Submission Guidelines:</p>
                        <p>1. Spam or malicious links are immediately rejected and banned.</p>
                        <p>2. Keep descriptions relevant so search keywords index properly.</p>
                        <p>3. Members count should match real channel size approximately.</p>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Submit Confirmation Modal */}
                {isSubmitModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className={`p-6 rounded-3xl border max-w-sm text-center space-y-4 shadow-2xl ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}>
                      <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto animate-pulse">
                        <AlertCircle className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-lg text-amber-500">Sent to Admin Queue!</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Waiting for Status Approval... Your submission is currently marked as <span className="text-amber-400 font-bold font-mono">pending</span>. The supervisor team will review links inside the control console.
                      </p>
                      <div className="pt-2">
                        <button 
                          onClick={() => {
                            setIsSubmitModalOpen(false);
                            window.location.hash = '#/';
                          }}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
                        >
                          Acknowledge & Back to Explorer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}


            {/* ROUTE VIEW 4: MY LINKS & USER PROFILE DASHBOARD */}
            {currentHash === '#/profile' && (
              <div className="space-y-6">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Your Dashboard Desk</h2>
                    <p className="text-xs text-slate-400">Track and manage your submitted communities & saved bookmark collections.</p>
                  </div>
                </div>

                {/* Dashboard grid metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Bio details card */}
                  <div className={`md:col-span-2 p-6 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-sm uppercase font-mono tracking-wider text-slate-400">Profile Details</h3>
                      {!isEditingProfile && (
                        <button 
                          onClick={() => setIsEditingProfile(true)}
                          className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>
                      )}
                    </div>

                    {isEditingProfile ? (
                      <form onSubmit={handleSaveProfile} className="space-y-4 mt-4 animate-fade-in">
                        <div className="space-y-1.5">
                          <label className={`text-xs block font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Avatar URL</label>
                          <input 
                            type="text"
                            value={editAvatarUrl}
                            onChange={(e) => setEditAvatarUrl(e.target.value)}
                            className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                              isDarkMode 
                                ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                                : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                            }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className={`text-xs block font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                          <input 
                            type="text"
                            required
                            value={editFullName}
                            onChange={(e) => setEditFullName(e.target.value)}
                            className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                              isDarkMode 
                                ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                                : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                            }`}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className={`text-xs block font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Your Bio description</label>
                          <textarea
                            rows={2}
                            value={editBio}
                            onChange={(e) => setEditBio(e.target.value)}
                            className={`w-full px-4 py-2.5 text-sm rounded-xl outline-none border transition-all ${
                              isDarkMode 
                                ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                                : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                            }`}
                          ></textarea>
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setIsEditingProfile(false)}
                            className="px-3 py-1.5 bg-slate-800 text-xs rounded-lg text-slate-300"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            className="px-4 py-1.5 bg-emerald-600 text-xs rounded-lg text-white font-bold"
                          >
                            Save Details
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center gap-4 mt-4">
                        <img 
                          src={editAvatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
                          alt={user?.profile?.full_name} 
                          className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
                          }}
                        />
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-slate-200">{editFullName || 'UfaqTechian'}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed max-w-md italic">
                            "{editBio || 'Passionate community organizer & explorer.'}"
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono block">Registered on SocialHub Web API Dashboard</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Micro stats counter widget */}
                  <div className={`p-6 rounded-2xl border flex flex-col justify-between ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <h3 className="font-bold text-sm uppercase font-mono tracking-wider text-slate-400">Total Activity</h3>
                    <div className="space-y-2 mt-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Total Submitted Links:</span>
                        <span className="font-bold font-mono text-emerald-400">
                          {links.filter(l => l.user_id === user?.id).length + pendingLinks.filter(l => l.user_id === user?.id).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Approved Links Count:</span>
                        <span className="font-bold font-mono text-sky-400">
                          {links.filter(l => l.user_id === user?.id).length}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Saved Bookmark Links:</span>
                        <span className="font-bold font-mono text-purple-400">{bookmarks.length}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* TWO TAB SECTIONS: 1. SUBMITTED LINKS (PENDING, APPROVED, REJECTED) | 2. BOOKMARKED/SAVED LINKS */}
                <div className="space-y-4">
                  
                  {/* Submitted Links sections */}
                  <div className={`p-6 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <h3 className="font-extrabold text-base tracking-tight mb-4 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                      <span>Your Submitted Invitation Links</span>
                    </h3>

                    {dbLoading ? (
                      <p className="text-xs text-slate-400 font-mono">Synchronizing state...</p>
                    ) : (
                      (() => {
                        // User submitted links can be gathered by combining links + pendingLinks for this user
                        const userShared = [
                          ...links.filter(l => l.user_id === user?.id),
                          ...pendingLinks.filter(l => l.user_id === user?.id),
                          // Also check rejected if we want, or from all links
                        ];

                        if (userShared.length === 0) {
                          return (
                            <div className="text-center py-8 text-slate-400">
                              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                              <p className="text-xs">You have not submitted any invitation links yet.</p>
                              <button 
                                onClick={() => window.location.hash = '#/submit'}
                                className="mt-2 text-xs text-emerald-400 hover:underline font-bold"
                              >
                                Submit Your Group Now &rarr;
                              </button>
                            </div>
                          );
                        }

                        return (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                                  <th className="py-2.5">Title</th>
                                  <th className="py-2.5">Platform</th>
                                  <th className="py-2.5">Category</th>
                                  <th className="py-2.5">Status</th>
                                  <th className="py-2.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/40">
                                {userShared.map((link) => {
                                  // Determine status badge
                                  let statusBg = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
                                  let statusLabel = 'Pending';
                                  if (link.status === 'approved') {
                                    statusBg = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
                                    statusLabel = 'Approved';
                                  } else if (link.status === 'rejected') {
                                    statusBg = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
                                    statusLabel = 'Rejected';
                                  }

                                  return (
                                    <tr key={link.id} className="hover:bg-slate-800/20">
                                      <td className="py-3 font-semibold text-slate-200">
                                        <p>{link.title}</p>
                                        <p className="text-[10px] text-slate-500 font-mono truncate max-w-xs">{link.url}</p>
                                      </td>
                                      <td className="py-3">
                                        <span className="font-medium text-slate-300">{link.platform}</span>
                                        <span className="text-[10px] text-slate-500 block">{link.sub_type}</span>
                                      </td>
                                      <td className="py-3 text-slate-400">{link.category}</td>
                                      <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold font-mono uppercase ${statusBg}`}>
                                          {statusLabel}
                                        </span>
                                      </td>
                                      <td className="py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <button 
                                            onClick={() => {
                                              setEditingLink(link);
                                              setIsAdminModalOpen(true);
                                            }}
                                            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                                            title="Edit community fields"
                                          >
                                            <Edit2 className="w-3.5 h-3.5" />
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteLink(link.id, link.title)}
                                            className="p-1.5 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-500 transition-colors"
                                            title="Delete link"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()
                    )}
                  </div>

                  {/* Saved Bookmarks collections list */}
                  <div className={`p-6 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <h3 className="font-extrabold text-base tracking-tight mb-4 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-rose-400" />
                      <span>Your Saved Bookmarks</span>
                    </h3>

                    {(() => {
                      const bookmarkedItems = links.filter(l => bookmarks.includes(l.id));
                      if (bookmarkedItems.length === 0) {
                        return (
                          <div className="text-center py-6 text-slate-400">
                            <p className="text-xs">No saved bookmarks yet.</p>
                            <p className="text-[10px] text-slate-500 mt-1">Click the bookmark icon on feed cards to pin communities here!</p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {bookmarkedItems.map((item) => {
                            const colors = getPlatformColors(item.platform);
                            return (
                              <div key={item.id} className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 flex items-start gap-3 justify-between">
                                <div className="space-y-1 overflow-hidden">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${colors.bg}`}>
                                    {item.platform}
                                  </span>
                                  <h4 className="font-bold text-slate-200 text-sm truncate">{item.title}</h4>
                                  <p className="text-[11px] text-slate-400 line-clamp-1">{item.description}</p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <a 
                                    href={item.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                                    title="Open link"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                  <button 
                                    onClick={() => handleToggleBookmark(item.id)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-rose-400"
                                    title="Remove pinned item"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                </div>

              </div>
            )}


            {/* ROUTE VIEW 5: SECURE ADMIN CONTROL PANEL */}
            {currentHash === '#/admin' && (
              <div className="space-y-6">
                
                {/* Admin Page Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-amber-500" />
                      <h2 className="text-2xl font-bold tracking-tight">Supervisor Admin Desk</h2>
                    </div>
                    <p className="text-xs text-slate-400">Review pending invite links, override details, approve or reject submissions, and inspect audit trails.</p>
                  </div>
                  
                  {/* Status Indicator card */}
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-amber-400 font-mono font-bold">Authorized Session: Admin</span>
                  </div>
                </div>

                {/* Audit Metrics row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Queue Size</span>
                    <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{pendingLinks.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Approved Directory</span>
                    <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{links.length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Total User Accounts</span>
                    <p className="text-2xl font-bold text-sky-400 font-mono mt-1">2</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Audited Events</span>
                    <p className="text-2xl font-bold text-purple-400 font-mono mt-1">{auditLogs.length}</p>
                  </div>
                </div>

                {/* PENDING QUEUE SECTION */}
                <div className={`p-6 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="font-extrabold text-base tracking-tight mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-500 animate-bounce" />
                    <span>Pending Submissions Queue ({pendingLinks.length})</span>
                  </h3>

                  {pendingLinks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs">Congratulations! Queue is completely clean.</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">No community invitation links waiting for action.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingLinks.map((link) => {
                        const colors = getPlatformColors(link.platform);
                        return (
                          <div 
                            key={link.id} 
                            className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                          >
                            <div className="space-y-1.5 max-w-lg">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded ${colors.bg}`}>
                                  {link.platform} {link.sub_type}
                                </span>
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                                  {link.category}
                                </span>
                              </div>
                              <h4 className="font-extrabold text-slate-200 text-base">{link.title}</h4>
                              <p className="text-xs text-slate-400">{link.description || 'No custom description provided.'}</p>
                              <div className="space-y-1">
                                <p className="text-[10px] text-slate-500 font-mono">URL: <a href={link.url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">{link.url}</a></p>
                                <p className="text-[10px] text-slate-400">Listed size: <span className="font-bold text-emerald-400 font-mono">{link.member_count} members</span></p>
                              </div>
                            </div>

                            {/* Action controllers */}
                            <div className="flex items-center gap-2 self-start md:self-center">
                              <button 
                                onClick={() => handleApproveLink(link)}
                                className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-2 rounded-lg font-bold transition-all shadow shadow-emerald-500/10"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              
                              <button 
                                onClick={() => handleRejectLink(link)}
                                className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white text-xs px-3 py-2 rounded-lg font-bold transition-all shadow shadow-rose-500/10"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>

                              <button 
                                onClick={() => {
                                  setEditingLink(link);
                                  setIsAdminModalOpen(true);
                                }}
                                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg transition-all"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit fields</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* AUDIT LOGS ACTIVITY METRICS */}
                <div className={`p-6 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <h3 className="font-extrabold text-base tracking-tight mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span>Administrative Audit Logs</span>
                  </h3>

                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2 scrollbar-thin">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="text-xs p-3 rounded-lg bg-slate-900 border border-slate-800/80 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-slate-200 font-semibold">
                            {log.action} &middot; <span className="text-emerald-400 font-bold">{log.target_title}</span>
                          </p>
                          <p className="text-[10px] text-slate-500">Target Link ID: {log.target_id}</p>
                        </div>
                        <div className="text-right text-[10px] text-slate-400">
                          <p className="font-mono text-purple-400">by {log.admin_name}</p>
                          <p className="text-slate-500 mt-0.5">{new Date(log.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </main>

        </div>
      </div>

      {/* FLOATING ACTION ACTION BUTTON IN LOWER RIGHT (to open submit community page) */}
      <button 
        id="floating-submit-fab"
        onClick={() => {
          if (!user) {
            showToast('Please sign in to submit invitation links');
            window.location.hash = '#/auth';
          } else {
            window.location.hash = '#/submit';
          }
        }}
        title="Submit invitation link"
        className="fixed bottom-6 right-6 z-35 w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 shadow-emerald-500/25 cursor-pointer"
      >
        <Plus className="w-7 h-7" />
      </button>


      {/* MODAL 1: EDIT LINK DIALOG (ADMIN & USER SHARED) */}
      {isAdminModalOpen && editingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`p-6 rounded-3xl border w-full max-w-lg space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <h3 className="font-bold text-lg text-emerald-400">Modify Link Specification</h3>
              <button onClick={() => { setIsAdminModalOpen(false); setEditingLink(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditLink} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Platform</label>
                  <select
                    value={editingLink.platform}
                    onChange={(e) => setEditingLink({ ...editingLink, platform: e.target.value as any })}
                    className={`w-full text-xs p-2 rounded-lg outline-none border transition-all ${
                      isDarkMode 
                        ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500' 
                        : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                    }`}
                  >
                    <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="WhatsApp">WhatsApp</option>
                    <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Telegram">Telegram</option>
                    <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Facebook">Facebook</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Sub Type</label>
                  <select
                    value={editingLink.sub_type}
                    onChange={(e) => setEditingLink({ ...editingLink, sub_type: e.target.value as any })}
                    className={`w-full text-xs p-2 rounded-lg outline-none border transition-all ${
                      isDarkMode 
                        ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500' 
                        : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                    }`}
                  >
                    <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Group">Group</option>
                    <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Channel">Channel</option>
                    <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Page">Page</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Category</label>
                <select
                  value={editingLink.category}
                  onChange={(e) => setEditingLink({ ...editingLink, category: e.target.value })}
                  className={`w-full text-xs p-2 rounded-lg outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                  }`}
                >
                  {categories.map((cat) => (
                    <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Title</label>
                <input 
                  type="text"
                  required
                  value={editingLink.title}
                  onChange={(e) => setEditingLink({ ...editingLink, title: e.target.value })}
                  className={`w-full text-xs p-2.5 rounded-lg outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Description</label>
                <textarea
                  rows={2}
                  value={editingLink.description || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, description: e.target.value })}
                  className={`w-full text-xs p-2.5 rounded-lg outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                  }`}
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Invitation URL</label>
                <input 
                  type="url"
                  required
                  value={editingLink.url}
                  onChange={(e) => setEditingLink({ ...editingLink, url: e.target.value })}
                  className={`w-full text-xs p-2.5 rounded-lg outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cover Image URL</label>
                <input 
                  type="text"
                  value={editingLink.image_url || ''}
                  onChange={(e) => setEditingLink({ ...editingLink, image_url: cleanImageUrl(e.target.value) })}
                  className={`w-full text-xs p-2.5 rounded-lg outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Member Count (Numeric)</label>
                <input 
                  type="number"
                  min="0"
                  value={editingLink.member_count}
                  onChange={(e) => setEditingLink({ ...editingLink, member_count: parseInt(e.target.value) || 0 })}
                  className={`w-full text-xs p-2.5 rounded-lg outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-850 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                  }`}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => { setIsAdminModalOpen(false); setEditingLink(null); }}
                  className="px-4 py-2 bg-slate-800 text-xs font-semibold rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-xs font-bold rounded-lg text-white"
                >
                  Save Specification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 2: COMMUNITY RULES MODAL */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`p-6 rounded-3xl border w-full max-w-md space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">Community Guidelines & Rules</h3>
              </div>
              <button onClick={() => setIsRulesModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-400 leading-relaxed pr-1 max-h-96 overflow-y-auto">
              <div className="space-y-1">
                <p className="font-bold text-slate-200">1. Verification Integrity</p>
                <p>All shared WhatsApp groups, Telegram channels, and Facebook pages undergo dynamic review by the supervisors. Broken or false links will be immediately purged.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-200">2. Classification Accuracy</p>
                <p>Ensure the links represent the correct subtype (Group vs Channel vs Page) and classification category. Repeated failures to tag correctly may restrict your submission quota.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-200">3. Respect & Safety (18+ Guardrails)</p>
                <p>Adult-oriented communities or highly sensitive political assets must be categorized under '18+' only. Uncategorized sensitive items are permanently banned.</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-200">4. Community Growth Accents</p>
                <p>Provide actual sizes/member counts to capture the ExtraBold sky blue indicator. Spammed or inflated fake numbers will lead to link rejection.</p>
              </div>
            </div>

            <button 
              onClick={() => setIsRulesModalOpen(false)}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-all"
            >
              I Understand Rules
            </button>
          </div>
        </div>
      )}


      {/* MODAL 3: SUPPORT DESK DRAWER MODAL */}
      {isSupportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`p-6 rounded-3xl border w-full max-w-md space-y-4 shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex justify-between items-center pb-2 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base">Team Support Desk</h3>
              </div>
              <button onClick={() => setIsSupportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Subject</label>
                <select
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-lg outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-850 border-slate-700 text-slate-200 focus:border-emerald-500' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                  }`}
                >
                  <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="General Inquiry">General Inquiry</option>
                  <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Link Moderation Issue">Link Moderation Issue</option>
                  <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Partnership / Feature Requests">Partnership / Feature Requests</option>
                  <option className={isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-white text-slate-700'} value="Report Bug">Report Bug</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className={`text-[10px] font-bold font-mono uppercase block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can we help you? Please describe in detail..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className={`w-full text-xs p-2.5 rounded-lg outline-none border transition-all ${
                    isDarkMode 
                      ? 'bg-slate-850 border-slate-700 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30' 
                      : 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20'
                  }`}
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg"
              >
                Send Support Ticket
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer id="main-footer" className={`border-t transition-colors mt-12 py-8 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200">UfaqTech SocialHub Web App Companion v1.0.2</span>
          </div>
          <div className="flex items-center gap-4">
            <span onClick={() => setIsRulesModalOpen(true)} className="hover:text-emerald-400 cursor-pointer">Rules</span>
            <span>&bull;</span>
            <span onClick={() => setIsSupportModalOpen(true)} className="hover:text-emerald-400 cursor-pointer">Support Desk</span>
            <span>&bull;</span>
            <span>Inspired by official Google Play Store Android applet.</span>
          </div>
          <div>
            <p className="text-[10px] font-mono text-slate-500">© 2026 UfaqTech Global Networks. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
