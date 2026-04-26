import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryPage } from './pages/CategoryPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminArticlesPage } from './pages/admin/AdminArticlesPage';
import { AdminArticleEditor } from './pages/admin/AdminArticleEditor';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminTagsPage } from './pages/admin/AdminTagsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminBreakingNewsPage } from './pages/admin/AdminBreakingNewsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: 'article/:id',
        Component: ArticlePage,
      },
      {
        path: 'category/:slug',
        Component: CategoryPage,
      },
      {
        path: 'tag/:tag',
        Component: CategoryPage,
      },
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'signup',
        Component: SignupPage,
      },
      {
        path: '*',
        Component: NotFoundPage,
      },
    ],
  },
  {
    path: '/admin',
    Component: AdminProtectedRoute,
    children: [
      {
        Component: AdminLayout,
        children: [
          {
            index: true,
            Component: AdminDashboard,
          },
          {
            path: 'articles',
            Component: AdminArticlesPage,
          },
          {
            path: 'articles/new',
            Component: AdminArticleEditor,
          },
          {
            path: 'articles/:id',
            Component: AdminArticleEditor,
          },
          {
            path: 'categories',
            Component: AdminCategoriesPage,
          },
          {
            path: 'tags',
            Component: AdminTagsPage,
          },
          {
            path: 'users',
            Component: AdminUsersPage,
          },
          {
            path: 'breaking-news',
            Component: AdminBreakingNewsPage,
          },
        ],
      },
    ],
  },
]);