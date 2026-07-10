export type UserRole = 'user' | 'admin';
export type AdminRole = 'admin' | 'manager' | 'worker' | 'viewer';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: UserRole;
  is_banned: boolean;
  shadow_banned: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon_name: string | null;
  created_at: string;
}

export interface SocialLink {
  id: string;
  user_id: string;
  platform: 'WhatsApp' | 'Telegram' | 'Facebook';
  sub_type: 'Group' | 'Channel' | 'Page';
  category: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  member_count: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  link_id: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_name: string;
  action: string;
  target_id: string;
  target_title: string;
  created_at: string;
}
