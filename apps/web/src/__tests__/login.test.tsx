import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../app/auth/login/page';

describe('Login Page', () => {
  it('renders login form', () => {
    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: /로그인/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/이메일/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/비밀번호/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  it('renders register link', () => {
    render(<LoginPage />);

    const registerLink = screen.getByRole('link', { name: /회원가입/i });
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  it('updates email input on change', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/이메일/i);
    await user.type(emailInput, 'test@example.com');

    expect(emailInput).toHaveValue('test@example.com');
  });

  it('updates password input on change', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/비밀번호/i);
    await user.type(passwordInput, 'password123');

    expect(passwordInput).toHaveValue('password123');
  });

  it('submits form with user data', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/이메일/i);
    const passwordInput = screen.getByLabelText(/비밀번호/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Login:', {
        email: 'test@example.com',
        password: 'password123',
      });
    });

    consoleSpy.mockRestore();
  });

  it('has required attribute on email input', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/이메일/i);
    expect(emailInput).toBeRequired();
  });

  it('has required attribute on password input', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/비밀번호/i);
    expect(passwordInput).toBeRequired();
  });

  it('email input has correct type', () => {
    render(<LoginPage />);

    const emailInput = screen.getByLabelText(/이메일/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('password input has correct type', () => {
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText(/비밀번호/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
