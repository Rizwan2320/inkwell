'use client';

import { useEffect, Component } from 'react';
import { useAppStore } from '@/lib/store';
import Header from '@/components/inkwell/Header';
import Footer from '@/components/inkwell/Footer';
import BlogHome from '@/components/inkwell/BlogHome';
import Dashboard from '@/components/inkwell/Dashboard';
import Posts from '@/components/inkwell/Posts';
import PostEditor from '@/components/inkwell/PostEditor';
import Categories from '@/components/inkwell/Categories';
import ArticleView from '@/components/inkwell/ArticleView';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center p-8">
            <h2 className="text-xl font-bold mb-2" style={{ color: '#FFFFFF' }}>Something went wrong</h2>
            <p className="text-sm mb-4" style={{ color: '#999999' }}>{this.state.error?.message || 'An unexpected error occurred'}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#00FF00', color: '#000000' }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Admin-only pages
const ADMIN_PAGES = ['dashboard', 'posts', 'categories', 'editor'];

export default function Home() {
  const { currentPage, setUser, isAdmin, navigate } = useAppStore();

  useEffect(() => {
    const init = async () => {
      try {
        const authRes = await fetch('/api/auth');
        const authData = await authRes.json();
        if (authData.user) {
          setUser(authData.user);
        }
      } catch {
        console.error('Failed to initialize auth');
      }
      try {
        // Auto-setup database if tables don't exist (first deploy)
        const setupRes = await fetch('/api/setup');
        const setupData = await setupRes.json();
        if (setupData.status === 'needs-setup') {
          await fetch('/api/setup', { method: 'POST' });
        }
      } catch {
        console.error('Failed to setup database');
      }
    };
    init();
  }, [setUser]);

  // Protect admin pages — redirect readers to blog
  useEffect(() => {
    if (!isAdmin && ADMIN_PAGES.includes(currentPage)) {
      navigate('blog');
    }
  }, [isAdmin, currentPage, navigate]);

  const renderPage = () => {
    switch (currentPage) {
      case 'blog':
        return <BlogHome key="blog" />;
      case 'article':
        return <ArticleView key="article" />;
      // Admin-only pages
      case 'dashboard':
        return isAdmin ? <Dashboard key="dashboard" /> : <BlogHome key="blog-redirect" />;
      case 'posts':
        return isAdmin ? <Posts key="posts" /> : <BlogHome key="blog-redirect" />;
      case 'editor':
        return isAdmin ? <PostEditor key="editor" /> : <BlogHome key="blog-redirect" />;
      case 'categories':
        return isAdmin ? <Categories key="categories" /> : <BlogHome key="blog-redirect" />;
      default:
        return <BlogHome key="blog-default" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#000000' }}>
      <Header />
      <main className="flex-1 animate-fade-in">
        <ErrorBoundary>
          {renderPage()}
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
