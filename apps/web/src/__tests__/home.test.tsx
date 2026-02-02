import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders the hero section with main heading', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('맛있는 레시피를');
  });

  it('renders navigation links', () => {
    render(<Home />);

    const recipesLink = screen.getByRole('link', { name: /레시피 둘러보기/i });
    const registerLink = screen.getByRole('link', { name: /시작하기/i });

    expect(recipesLink).toHaveAttribute('href', '/recipes');
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  it('renders feature cards as clickable links', () => {
    render(<Home />);

    const writeRecipeCard = screen.getByRole('link', { name: /쉬운 레시피 작성/i });
    const searchCard = screen.getByRole('link', { name: /스마트 검색/i });
    const likeCard = screen.getByRole('link', { name: /좋아요 & 저장/i });

    expect(writeRecipeCard).toHaveAttribute('href', '/recipes/new');
    expect(searchCard).toHaveAttribute('href', '/recipes');
    expect(likeCard).toHaveAttribute('href', '/auth/login');
  });

  it('renders feature descriptions', () => {
    render(<Home />);

    expect(screen.getByText(/단계별 사진과 함께/)).toBeInTheDocument();
    expect(screen.getByText(/재료, 카테고리, 조리 시간으로/)).toBeInTheDocument();
    expect(screen.getByText(/마음에 드는 레시피를 저장/)).toBeInTheDocument();
  });

  it('renders the features section heading', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: /Recipe Share의 특별한 기능/i })).toBeInTheDocument();
  });
});
