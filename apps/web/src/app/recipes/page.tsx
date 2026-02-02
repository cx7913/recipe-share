'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Recipe } from '@/types';
import RecipeCard from '@/components/RecipeCard';
import { useAuth } from '@/contexts/AuthContext';

export default function RecipesPage() {
  const { isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchRecipes = async (pageNum: number) => {
    try {
      setIsLoading(true);
      const response = await api.getRecipes({ page: pageNum, limit: 12 });
      const data = response.data;

      if (Array.isArray(data)) {
        if (pageNum === 1) {
          setRecipes(data);
        } else {
          setRecipes((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === 12);
      } else if (data.data) {
        if (pageNum === 1) {
          setRecipes(data.data);
        } else {
          setRecipes((prev) => [...prev, ...data.data]);
        }
        setHasMore(data.data.length === 12);
      }
    } catch (err: any) {
      setError('레시피를 불러오는데 실패했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecipes(nextPage);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">레시피 목록</h1>
          {isAuthenticated && (
            <Link
              href="/recipes/new"
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
            >
              레시피 작성
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {isLoading && recipes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 레시피가 없습니다</h3>
            <p className="text-gray-500 mb-4">첫 번째 레시피를 작성해보세요!</p>
            {isAuthenticated ? (
              <Link
                href="/recipes/new"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                레시피 작성하기
              </Link>
            ) : (
              <Link
                href="/auth/register"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                회원가입하고 시작하기
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="px-6 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {isLoading ? '불러오는 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
