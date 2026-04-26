/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'admin' | 'editor' | 'journalist' | 'user';
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_id: string;
  category_id: string | null;
  status: 'draft' | 'published' | 'archived';
  views: number;
  featured: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleWithDetails extends Article {
  author: Profile;
  category: Category;
  tags: Tag[];
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BreakingNews {
  id: string;
  text: string;
  active: boolean;
  created_at: string;
}