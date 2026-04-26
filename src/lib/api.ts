import { supabase, type Article, type ArticleWithDetails, type Category, type Tag, type BreakingNews, type Profile } from './supabase';

const PAGE_SIZE = 10;

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

export async function getBreakingNews(): Promise<BreakingNews | null> {
  const { data, error } = await supabase
    .from('breaking_news')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) return null;
  return data;
}

export async function getArticles(options?: {
  categorySlug?: string;
  tagSlug?: string;
  limit?: number;
  offset?: number;
  featured?: boolean;
}): Promise<ArticleWithDetails[]> {
  const { categorySlug, tagSlug, limit = PAGE_SIZE, offset = 0, featured = false } = options || {};
  
  let query = supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id(id, email, full_name, avatar_url, role, bio),
      category:categories!category_id(id, name, slug, description, color),
      tags:article_tags!article_tags_article_fkey(tag_id, name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (categorySlug) {
    query = query.eq('category.slug', categorySlug);
  }

  if (featured) {
    query = query.eq('featured', true);
  }

  let { data, error } = await query;

  if (error) throw error;
  if (!data) return [];

  if (tagSlug) {
    data = data.filter(article => 
      article.tags?.some((tag: Tag) => tag.slug === tagSlug)
    );
  }

  return data as ArticleWithDetails[];
}

export async function getArticleBySlug(slug: string): Promise<ArticleWithDetails | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id(id, email, full_name, avatar_url, role, bio),
      category:categories!category_id(id, name, slug, description, color),
      tags:article_tags!article_tags_article_fkey(tag_id, name, slug, created_at)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) return null;

  try {
    await supabase.rpc('increment_article_views', { article_id: data.id });
  } catch (e) {}

  return data as ArticleWithDetails;
}

export async function getArticleById(id: string): Promise<ArticleWithDetails | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id(id, email, full_name, avatar_url, role, bio),
      category:categories!category_id(id, name, slug, description, color),
      tags:article_tags!article_tags_article_fkey(tag_id, name, slug, created_at)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return data as ArticleWithDetails;
}

export async function getFeaturedArticle(): Promise<ArticleWithDetails | null> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id(id, email, full_name, avatar_url, role, bio),
      category:categories!category_id(id, name, slug, description, color),
      tags:article_tags!article_tags_article_fkey(tag_id, name, slug)
    `)
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(1)
    .single();

  if (error) return null;
  return data as ArticleWithDetails;
}

export async function getTrendingArticles(limit = 5): Promise<ArticleWithDetails[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id(id, email, full_name, avatar_url, role, bio),
      category:categories!category_id(id, name, slug, description, color)
    `)
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getRelatedArticles(articleId: string, categoryId: string, limit = 4): Promise<ArticleWithDetails[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id(id, email, full_name, avatar_url, role, bio),
      category:categories!category_id(id, name, slug, description, color)
    `)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', articleId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function searchArticles(query: string, limit = 10): Promise<ArticleWithDetails[]> {
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!author_id(id, email, full_name, avatar_url, role, bio),
      category:categories!category_id(id, name, slug, description, color)
    `)
    .eq('status', 'published')
    .ilike('title', `%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function createArticle(article: {
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  category_id?: string;
  status?: 'draft' | 'published';
  featured?: boolean;
}): Promise<Article> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('articles')
    .insert({
      ...article,
      author_id: user.id,
      published_at: article.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateArticle(id: string, updates: Partial<{
  title: string;
  slug: string;
  subtitle: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category_id: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  published_at?: string | null;
}>): Promise<Article> {
  const updateData: any = { ...updates };
  
  if (updates.status === 'published' && !updates.published_at) {
    updateData.published_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('articles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase
    .from('articles')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function addTagsToArticle(articleId: string, tagIds: string[]): Promise<void> {
  const articleTags = tagIds.map(tagId => ({
    article_id: articleId,
    tag_id: tagId,
  }));

  const { error } = await supabase
    .from('article_tags')
    .upsert(articleTags);

  if (error) throw error;
}

export async function removeTagsFromArticle(articleId: string, tagIds: string[]): Promise<void> {
  const { error } = await supabase
    .from('article_tags')
    .delete()
    .eq('article_id', articleId)
    .in('tag_id', tagIds);

  if (error) throw error;
}

export async function uploadImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('articles')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('articles')
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function signUp(email: string, password: string, fullName?: string): Promise<{ user: any; session: any }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) throw error;
  return { user: data.user, session: data.session };
}

export async function signIn(email: string, password: string): Promise<{ user: any; session: any }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return { user: data.user, session: data.session };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) return null;
  return data;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}