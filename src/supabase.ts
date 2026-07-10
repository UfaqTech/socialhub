import { createClient } from '@supabase/supabase-js';
import { SocialLink, Category, Profile, AdminProfile, AuditLog } from './types';

// Read from env
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if configured
const isRealSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here';

// Initialize real client if configured
export const supabase = isRealSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Simulated Local Database (Pre-seeded high-fidelity data)
const PRE_SEEDED_CATEGORIES: Category[] = [
  { id: 1, name: 'Educational', slug: 'educational', icon_name: 'GraduationCap', created_at: new Date().toISOString() },
  { id: 2, name: 'Programming', slug: 'programming', icon_name: 'Code2', created_at: new Date().toISOString() },
  { id: 3, name: 'Tech', slug: 'tech', icon_name: 'Laptop', created_at: new Date().toISOString() },
  { id: 4, name: 'Funny', slug: 'funny', icon_name: 'Laugh', created_at: new Date().toISOString() },
  { id: 5, name: '18+', slug: '18-plus', icon_name: 'ShieldAlert', created_at: new Date().toISOString() },
  { id: 6, name: 'Business', slug: 'business', icon_name: 'Briefcase', created_at: new Date().toISOString() },
  { id: 7, name: 'Entertainment', slug: 'entertainment', icon_name: 'Clapperboard', created_at: new Date().toISOString() },
  { id: 8, name: 'News', slug: 'news', icon_name: 'Newspaper', created_at: new Date().toISOString() },
];

const PRE_SEEDED_LINKS: SocialLink[] = [
  {
    id: 'link-1',
    user_id: 'user-default-id',
    platform: 'WhatsApp',
    sub_type: 'Group',
    category: 'Entertainment',
    title: 'ONLY FRIENDS ZONE',
    description: 'A vibrant community for sharing updates, resources, and discussion.',
    url: 'https://chat.whatsapp.com/example-only-friends-zone',
    image_url: 'https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&w=800&q=80',
    member_count: 240,
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'link-2',
    user_id: 'user-default-id',
    platform: 'Telegram',
    sub_type: 'Channel',
    category: 'Educational',
    title: 'phantom files',
    description: 'A vibrant community for sharing updates, resources, and discussion.',
    url: 'https://t.me/example-phantom-files',
    image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    member_count: 1450,
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'link-3',
    user_id: 'user-default-id',
    platform: 'Facebook',
    sub_type: 'Page',
    category: 'Programming',
    title: 'Dark web',
    description: 'A vibrant community for sharing updates, resources, and discussion.',
    url: 'https://facebook.com/example-dark-web-hub',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    member_count: 8520,
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'link-4',
    user_id: 'admin-default-id',
    platform: 'WhatsApp',
    sub_type: 'Group',
    category: 'Tech',
    title: 'UfaqTech Global Lounge',
    description: 'Official group to discuss mobile app building, responsive templates, and backend architecture.',
    url: 'https://chat.whatsapp.com/ufaqtech-global-lounge',
    image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    member_count: 380,
    status: 'approved',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'link-5',
    user_id: 'user-default-id',
    platform: 'Telegram',
    sub_type: 'Group',
    category: 'Business',
    title: 'SaaS Builders Elite',
    description: 'Connect with developers launching custom products and software-as-a-service ideas.',
    url: 'https://t.me/saas-builders-elite',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    member_count: 0,
    status: 'pending',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

const PRE_SEEDED_PROFILES: Record<string, Profile> = {
  'user-default-id': {
    id: 'user-default-id',
    full_name: 'Awaiss Mawais',
    email: 'mawais03415942806@gmail.com',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    role: 'user',
    is_banned: false,
    shadow_banned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  'admin-default-id': {
    id: 'admin-default-id',
    full_name: 'UfaqTech Admin',
    email: 'admin@ufaqtech.com',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    role: 'admin',
    is_banned: false,
    shadow_banned: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const PRE_SEEDED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    admin_id: 'admin-default-id',
    admin_name: 'UfaqTech Admin',
    action: 'Approved Link',
    target_id: 'link-1',
    target_title: 'ONLY FRIENDS ZONE',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'log-2',
    admin_id: 'admin-default-id',
    admin_name: 'UfaqTech Admin',
    action: 'Approved Link',
    target_id: 'link-3',
    target_title: 'Dark web',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  }
];

// Initialize localStorage DB if empty
if (!localStorage.getItem('socialhub_categories')) {
  localStorage.setItem('socialhub_categories', JSON.stringify(PRE_SEEDED_CATEGORIES));
}
if (!localStorage.getItem('socialhub_links')) {
  localStorage.setItem('socialhub_links', JSON.stringify(PRE_SEEDED_LINKS));
}
if (!localStorage.getItem('socialhub_profiles')) {
  localStorage.setItem('socialhub_profiles', JSON.stringify(PRE_SEEDED_PROFILES));
}
if (!localStorage.getItem('socialhub_audit_logs')) {
  localStorage.setItem('socialhub_audit_logs', JSON.stringify(PRE_SEEDED_AUDIT_LOGS));
}

// Local Database Helpers
const getLocalData = <T>(key: string): T => {
  return JSON.parse(localStorage.getItem(key) || '[]') as T;
};

const setLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Unified API Wrapper
export const socialHubApi = {
  isUsingRealSupabase: !!isRealSupabaseConfigured,

  // Authentication Helpers
  async getCurrentUser() {
    if (isRealSupabaseConfigured && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      
      // Get role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return {
        ...user,
        profile: profile || { role: 'user', full_name: user.email?.split('@')[0] }
      };
    } else {
      const currentSession = localStorage.getItem('socialhub_session_user_id');
      if (!currentSession) return null;
      const profiles = getLocalData<Record<string, Profile>>('socialhub_profiles');
      const profile = profiles[currentSession];
      if (!profile) return null;
      return {
        id: profile.id,
        email: profile.email,
        profile
      };
    }
  },

  async signIn(email: string, password: string, rememberMe = true) {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null, error };
      
      // Fetch role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      return {
        user: { ...data.user, profile },
        error: null
      };
    } else {
      // Simulate Auth
      const profiles = getLocalData<Record<string, Profile>>('socialhub_profiles');
      const userProfile = Object.values(profiles).find(p => p.email.toLowerCase() === email.toLowerCase());
      
      if (!userProfile) {
        // If password is 'admin' or matching user we can mock it, or just register them automatically to make it incredibly easy!
        if (email.includes('admin')) {
          // Auto create or fetch admin
          const adminId = 'admin-default-id';
          if (rememberMe) {
            localStorage.setItem('socialhub_session_user_id', adminId);
          }
          return {
            user: { id: adminId, email, profile: profiles[adminId] },
            error: null
          };
        } else {
          // For sandbox simplicity, register new user on demand!
          const newId = 'user-' + Math.random().toString(36).substr(2, 9);
          const newProfile: Profile = {
            id: newId,
            full_name: email.split('@')[0],
            email,
            avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
            role: 'user',
            is_banned: false,
            shadow_banned: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          profiles[newId] = newProfile;
          setLocalData('socialhub_profiles', profiles);
          
          if (rememberMe) {
            localStorage.setItem('socialhub_session_user_id', newId);
          }
          return {
            user: { id: newId, email, profile: newProfile },
            error: null
          };
        }
      }

      if (rememberMe) {
        localStorage.setItem('socialhub_session_user_id', userProfile.id);
      } else {
        sessionStorage.setItem('socialhub_session_user_id', userProfile.id);
      }

      return {
        user: { id: userProfile.id, email: userProfile.email, profile: userProfile },
        error: null
      };
    }
  },

  async signUp(email: string, password: string, fullName: string, rememberMe = true) {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      if (error) return { user: null, error };
      
      // Insert profile triggers automatically on backend or we do it here if needed
      const profileData = {
        id: data.user!.id,
        full_name: fullName,
        email: email,
        role: 'user'
      };
      
      await supabase.from('profiles').upsert(profileData);
      
      return {
        user: { ...data.user, profile: profileData },
        error: null
      };
    } else {
      const profiles = getLocalData<Record<string, Profile>>('socialhub_profiles');
      const exists = Object.values(profiles).some(p => p.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return { user: null, error: { message: 'User already exists' } };
      }

      const newId = 'user-' + Math.random().toString(36).substr(2, 9);
      const newProfile: Profile = {
        id: newId,
        full_name: fullName,
        email,
        avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
        role: 'user',
        is_banned: false,
        shadow_banned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      profiles[newId] = newProfile;
      setLocalData('socialhub_profiles', profiles);

      if (rememberMe) {
        localStorage.setItem('socialhub_session_user_id', newId);
      }

      return {
        user: { id: newId, email, profile: newProfile },
        error: null
      };
    }
  },

  async signOut() {
    if (isRealSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('socialhub_session_user_id');
    sessionStorage.removeItem('socialhub_session_user_id');
  },

  // Profiles
  async getProfile(userId: string) {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      return data;
    } else {
      const profiles = getLocalData<Record<string, Profile>>('socialhub_profiles');
      return profiles[userId] || null;
    }
  },

  async updateProfileBio(userId: string, fullName: string, bio: string, avatarUrl?: string) {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      return { data, error };
    } else {
      const profiles = getLocalData<Record<string, Profile>>('socialhub_profiles');
      if (profiles[userId]) {
        profiles[userId].full_name = fullName;
        if (avatarUrl) profiles[userId].avatar_url = avatarUrl;
        // Since 'bio' is not strictly in the DB schema, we can store it inside the profile's description
        // by attaching a bio property if needed, or update full name and avatar url as defined.
        (profiles[userId] as any).bio = bio;
        profiles[userId].updated_at = new Date().toISOString();
        setLocalData('socialhub_profiles', profiles);
        return { data: profiles[userId], error: null };
      }
      return { data: null, error: { message: 'Profile not found' } };
    }
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    if (isRealSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      return data || PRE_SEEDED_CATEGORIES;
    } else {
      return getLocalData<Category[]>('socialhub_categories');
    }
  },

  // Links
  async getApprovedLinks(): Promise<SocialLink[]> {
    if (isRealSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      return data || [];
    } else {
      const links = getLocalData<SocialLink[]>('socialhub_links');
      return links.filter(l => l.status === 'approved');
    }
  },

  async getUserLinks(userId: string): Promise<SocialLink[]> {
    if (isRealSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      return data || [];
    } else {
      const links = getLocalData<SocialLink[]>('socialhub_links');
      return links.filter(l => l.user_id === userId);
    }
  },

  async getPendingLinks(): Promise<SocialLink[]> {
    if (isRealSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('links')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      return data || [];
    } else {
      const links = getLocalData<SocialLink[]>('socialhub_links');
      return links.filter(l => l.status === 'pending');
    }
  },

  async submitLink(link: Omit<SocialLink, 'id' | 'user_id' | 'status' | 'created_at'>, userId: string) {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('links')
        .insert({
          ...link,
          user_id: userId,
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      return { data, error };
    } else {
      const links = getLocalData<SocialLink[]>('socialhub_links');
      const newLink: SocialLink = {
        ...link,
        id: 'link-' + Math.random().toString(36).substr(2, 9),
        user_id: userId,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      links.push(newLink);
      setLocalData('socialhub_links', links);
      return { data: newLink, error: null };
    }
  },

  async updateLinkStatus(linkId: string, status: 'approved' | 'rejected') {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('links')
        .update({ status })
        .eq('id', linkId)
        .select()
        .single();
      return { data, error };
    } else {
      const links = getLocalData<SocialLink[]>('socialhub_links');
      const idx = links.findIndex(l => l.id === linkId);
      if (idx > -1) {
        links[idx].status = status;
        setLocalData('socialhub_links', links);
        return { data: links[idx], error: null };
      }
      return { data: null, error: { message: 'Link not found' } };
    }
  },

  async updateLink(linkId: string, updates: Partial<SocialLink>) {
    if (isRealSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', linkId)
        .select()
        .single();
      return { data, error };
    } else {
      const links = getLocalData<SocialLink[]>('socialhub_links');
      const idx = links.findIndex(l => l.id === linkId);
      if (idx > -1) {
        links[idx] = { ...links[idx], ...updates };
        setLocalData('socialhub_links', links);
        return { data: links[idx], error: null };
      }
      return { data: null, error: { message: 'Link not found' } };
    }
  },

  async deleteLink(linkId: string) {
    if (isRealSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);
      return { error };
    } else {
      let links = getLocalData<SocialLink[]>('socialhub_links');
      links = links.filter(l => l.id !== linkId);
      setLocalData('socialhub_links', links);
      return { error: null };
    }
  },

  // Saved Bookmarks logic
  async getBookmarks(userId: string): Promise<string[]> {
    const saved = localStorage.getItem(`socialhub_bookmarks_${userId}`);
    return saved ? JSON.parse(saved) : [];
  },

  async toggleBookmark(userId: string, linkId: string): Promise<string[]> {
    const bookmarks = await this.getBookmarks(userId);
    let updated: string[];
    if (bookmarks.includes(linkId)) {
      updated = bookmarks.filter(id => id !== linkId);
    } else {
      updated = [...bookmarks, linkId];
    }
    localStorage.setItem(`socialhub_bookmarks_${userId}`, JSON.stringify(updated));
    return updated;
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    if (isRealSupabaseConfigured && supabase) {
      // Fetch or simulate audit logs (if we have an audit logs table, else preseeded)
      return PRE_SEEDED_AUDIT_LOGS;
    } else {
      return getLocalData<AuditLog[]>('socialhub_audit_logs');
    }
  },

  async addAuditLog(action: string, targetId: string, targetTitle: string, adminName: string) {
    const logs = getLocalData<AuditLog[]>('socialhub_audit_logs');
    const newLog: AuditLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 9),
      admin_id: 'admin-default-id',
      admin_name: adminName,
      action,
      target_id: targetId,
      target_title: targetTitle,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    setLocalData('socialhub_audit_logs', logs);
  },

  async isAdmin(userId: string): Promise<boolean> {
    if (isRealSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      return data?.role === 'admin';
    } else {
      const profiles = getLocalData<Record<string, Profile>>('socialhub_profiles');
      return profiles[userId]?.role === 'admin';
    }
  }
};
