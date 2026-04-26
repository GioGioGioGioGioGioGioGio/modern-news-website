-- Modern News Website - Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users with profile data)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'journalist', 'user')),
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#000000',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tags table
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  subtitle TEXT,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Article-Tags junction table
CREATE TABLE public.article_tags (
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Breaking news table
CREATE TABLE public.breaking_news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  text TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookmarks table
CREATE TABLE public.bookmarks (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Policies

-- Profiles: users can read all, update own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Categories: everyone can read, only admins can modify
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert categories" ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update categories" ON public.categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete categories" ON public.categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Tags: everyone can read, only admins can modify
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public tags are viewable by everyone" ON public.tags
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert tags" ON public.tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update tags" ON public.tags
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete tags" ON public.tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Articles: public can read published, authors can manage own, admins can manage all
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public articles are viewable by everyone" ON public.articles
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins can insert articles" ON public.articles
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor', 'journalist'))
  );

CREATE POLICY "Authors can update own articles" ON public.articles
  FOR UPDATE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
  );

CREATE POLICY "Authors can delete own articles" ON public.articles
  FOR DELETE USING (
    author_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Article tags: public can read
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public article_tags are viewable by everyone" ON public.article_tags
  FOR SELECT USING (true);

CREATE POLICY "Authors can manage article tags" ON public.article_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.articles a
      JOIN public.profiles p ON a.author_id = p.id
      WHERE a.id = article_id AND (p.id = auth.uid() OR p.role IN ('admin', 'editor'))
    )
  );

-- Comments: authenticated users can create, only owner/admins can modify
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Breaking news: everyone can read active, only admins can manage
ALTER TABLE public.breaking_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public breaking_news are viewable by everyone" ON public.breaking_news
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage breaking_news" ON public.breaking_news
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Bookmarks: users can manage own
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bookmarks" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_views ON articles(views DESC);
CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX idx_comments_article ON comments(article_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, color) VALUES
  ('Politica', 'politica', 'Notizie politiche nazionali e internazionali', '#dc2626'),
  ('Economia', 'economia', 'Finanza, mercati e economia', '#059669'),
  ('Tecnologia', 'tecnologia', 'Innovazione tech e digitale', '#7c3aed'),
  ('Cultura', 'cultura', 'Arte, spettacolo e cultura', '#db2777'),
  ('Sport', 'sport', 'Eventi sportivi e risultati', '#2563eb'),
  ('Scienza', 'scienza', 'Scoperte scientifiche e ricerca', '#0891b2'),
  ('Mondo', 'mondo', 'Notizie dal mondo', '#ea580c')
ON CONFLICT (slug) DO NOTHING;

-- Function to increment article views
CREATE OR REPLACE FUNCTION increment_article_views(article_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE articles SET views = views + 1 WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default tags
INSERT INTO public.tags (name, slug) VALUES
  ('Attualità', 'attualita'),
  ('Ambiente', 'ambiente'),
  ('Salute', 'salute'),
  ('Istruzione', 'istruzione'),
  ('Lavoro', 'lavoro'),
  ('Tech', 'tech'),
  ('Innovazione', 'innovazione'),
  ('Eventi', 'eventi'),
  ('Opinion', 'opinion')
ON CONFLICT (slug) DO NOTHING;