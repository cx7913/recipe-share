'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AxiosError } from 'axios';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface ApiError {
  message?: string;
}

interface IngredientInput {
  name: string;
  amount: string;
  unit: string;
}

interface StepInput {
  description: string;
}

export default function NewRecipePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cookingTime: '',
    servings: '',
    difficulty: 'EASY',
  });

  const [ingredients, setIngredients] = useState<IngredientInput[]>([
    { name: '', amount: '', unit: '' },
  ]);

  const [steps, setSteps] = useState<StepInput[]>([{ description: '' }]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/recipes/new');
    }
  }, [authLoading, isAuthenticated, router]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', amount: '', unit: '' }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, field: keyof IngredientInput, value: string) => {
    const updated = [...ingredients];
    updated[index][field] = value;
    setIngredients(updated);
  };

  const addStep = () => {
    setSteps([...steps, { description: '' }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    }
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...steps];
    updated[index].description = value;
    setSteps(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('레시피 제목을 입력해주세요.');
      return;
    }

    const validIngredients = ingredients.filter((i) => i.name.trim());
    const validSteps = steps.filter((s) => s.description.trim());

    if (validIngredients.length === 0) {
      setError('최소 1개의 재료를 입력해주세요.');
      return;
    }

    if (validSteps.length === 0) {
      setError('최소 1개의 조리 단계를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const recipeData = {
        title: formData.title,
        description: formData.description,
        cookingTime: parseInt(formData.cookingTime) || 30,
        servings: parseInt(formData.servings) || 2,
        difficulty: formData.difficulty,
        ingredients: validIngredients,
        steps: validSteps.map((s, index) => ({
          order: index + 1,
          description: s.description,
        })),
      };

      const response = await api.createRecipe(recipeData);
      router.push(`/recipes/${response.data.id}`);
    } catch (err) {
      const error = err as AxiosError<ApiError>;
      setError(error.response?.data?.message || '레시피 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/recipes" className="text-primary-600 hover:text-primary-500">
            &larr; 레시피 목록으로
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">새 레시피 작성</h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                레시피 제목 *
              </label>
              <input
                id="title"
                type="text"
                required
                placeholder="예: 엄마표 김치찌개"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                레시피 설명
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="레시피에 대한 간단한 설명을 입력하세요"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">
                  조리 시간 (분)
                </label>
                <input
                  id="cookingTime"
                  type="number"
                  min="1"
                  placeholder="30"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.cookingTime}
                  onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="servings" className="block text-sm font-medium text-gray-700">
                  인분
                </label>
                <input
                  id="servings"
                  type="number"
                  min="1"
                  placeholder="2"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">
                  난이도
                </label>
                <select
                  id="difficulty"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  disabled={isSubmitting}
                >
                  <option value="EASY">쉬움</option>
                  <option value="MEDIUM">보통</option>
                  <option value="HARD">어려움</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">재료 *</label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + 재료 추가
                </button>
              </div>
              <div className="space-y-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="재료명"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      placeholder="양"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      placeholder="단위"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      disabled={isSubmitting}
                    />
                    {ingredients.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="px-2 text-red-500 hover:text-red-700"
                        disabled={isSubmitting}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">조리 순서 *</label>
                <button
                  type="button"
                  onClick={addStep}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  + 단계 추가
                </button>
              </div>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <textarea
                      placeholder={`${index + 1}단계 설명`}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={step.description}
                      onChange={(e) => updateStep(index, e.target.value)}
                      disabled={isSubmitting}
                    />
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="px-2 text-red-500 hover:text-red-700 self-start mt-2"
                        disabled={isSubmitting}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '등록 중...' : '레시피 등록'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
