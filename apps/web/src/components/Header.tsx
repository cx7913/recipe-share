'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Recipe Share
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/recipes"
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              레시피
            </Link>

            {isLoading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded" />
            ) : isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/recipes/new"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm"
                >
                  레시피 작성
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{user?.name}</span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors text-sm"
                >
                  회원가입
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
