'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('access_token');
    setHasToken(!!token);

    // Check for dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    const shouldBeDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    if (newDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setHasToken(false);
    router.push('/');
  };

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-foreground">
          Portfolio
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-foreground hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="text-foreground hover:text-primary transition-colors"
          >
            Blog
          </Link>

          {hasToken ? (
            <>
              <Link
                href="/admin/moderation"
                className="text-foreground hover:text-primary transition-colors"
              >
                Moderation
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut size={20} />
              </Button>
            </>
          ) : (
            <Link
              href="/admin-login"
              className="text-foreground hover:text-primary transition-colors"
            >
              Admin
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        </div>
      </nav>
    </header>
  );
}
