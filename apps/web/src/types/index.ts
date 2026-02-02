// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

// Recipe Types
export interface Recipe {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: Category;
  ingredients: Ingredient[];
  steps: Step[];
  author: User;
  likesCount: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

export interface Step {
  id: string;
  order: number;
  description: string;
  imageUrl?: string;
}

// Request/Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateRecipeRequest {
  title: string;
  description: string;
  cookingTime: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  categoryId: string;
  ingredients: Omit<Ingredient, 'id'>[];
  steps: Omit<Step, 'id'>[];
}

// API Error
export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
