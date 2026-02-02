'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Recipe } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const difficultyLabels = {
  EASY: '쉬움',
  MEDIUM: '보통',
  HARD: '어려움',
};

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  const recipeId = params.id as string;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        const response = await api.getRecipe(recipeId);
        setRecipe(response.data);
      } catch {
        setError('레시피를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    try {
      setIsLiking(true);
      if (recipe?.isLiked) {
        await api.unlikeRecipe(recipeId);
        setRecipe((prev) =>
          prev ? { ...prev, isLiked: false, likesCount: prev.likesCount - 1 } : prev
        );
      } else {
        await api.likeRecipe(recipeId);
        setRecipe((prev) =>
          prev ? { ...prev, isLiked: true, likesCount: prev.likesCount + 1 } : prev
        );
      }
    } catch (err) {
      console.error('Failed to like recipe:', err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('정말로 이 레시피를 삭제하시겠습니까?')) return;

    try {
      await api.deleteRecipe(recipeId);
      router.push('/recipes');
    } catch {
      alert('레시피 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="aspect-video bg-gray-200 rounded-lg mb-6" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">레시피를 찾을 수 없습니다</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Link href="/recipes" className="text-primary-600 hover:text-primary-700">
            레시피 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const difficulty = recipe.difficulty?.toUpperCase() as keyof typeof difficultyLabels;
  const isAuthor = user?.id === recipe.author?.id;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/recipes" className="text-primary-600 hover:text-primary-500 mb-4 inline-block">
          &larr; 레시피 목록으로
        </Link>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {recipe.thumbnailUrl && (
            <div className="aspect-video relative">
              <Image
                src={recipe.thumbnailUrl}
                alt={recipe.title}
                fill
                sizes="(max-width: 1024px) 100vw, 896px"
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{recipe.title}</h1>
                <p className="text-gray-600">{recipe.description}</p>
              </div>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1 px-4 py-2 rounded-md transition-colors ${
                  recipe.isLiked
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={recipe.isLiked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                {recipe.likesCount || 0}
              </button>
            </div>

            <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {recipe.cookingTime}분
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {recipe.servings}인분
              </span>
              {difficulty && (
                <span className="px-2 py-1 bg-gray-100 rounded">
                  난이도: {difficultyLabels[difficulty] || recipe.difficulty}
                </span>
              )}
              {recipe.category && (
                <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded">
                  {recipe.category.name}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-b py-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center relative overflow-hidden">
                  {recipe.author?.profileImage ? (
                    <Image
                      src={recipe.author.profileImage}
                      alt={recipe.author.name}
                      fill
                      sizes="40px"
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500 font-medium">
                      {recipe.author?.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{recipe.author?.name || '익명'}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(recipe.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              </div>
              {isAuthor && (
                <div className="flex gap-2">
                  <Link
                    href={`/recipes/${recipe.id}/edit`}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    수정
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">재료</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={ingredient.id || index}
                      className="flex items-center gap-2 p-3 bg-gray-50 rounded"
                    >
                      <span className="w-2 h-2 bg-primary-500 rounded-full" />
                      <span className="flex-1">{ingredient.name}</span>
                      <span className="text-gray-500">
                        {ingredient.amount} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {recipe.steps && recipe.steps.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">조리 순서</h2>
                <ol className="space-y-4">
                  {recipe.steps
                    .sort((a, b) => a.order - b.order)
                    .map((step, index) => (
                      <li key={step.id || index} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
                          {step.order || index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-700">{step.description}</p>
                          {step.imageUrl && (
                            <div className="mt-2 relative aspect-video max-w-md">
                              <Image
                                src={step.imageUrl}
                                alt={`Step ${step.order || index + 1}`}
                                fill
                                sizes="(max-width: 768px) 100vw, 448px"
                                className="rounded-lg object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                </ol>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
