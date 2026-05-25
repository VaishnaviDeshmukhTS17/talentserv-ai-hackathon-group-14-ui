import { render, screen, fireEvent } from '@testing-library/react';
import Login from '../components/Login';

// Mock useNavigate and useLocation from react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: null })
}));

// Mock useAuth from App provider context
jest.mock('../App', () => ({
  useAuth: () => ({
    user: null,
    logout: jest.fn()
  })
}));

// Mock all Firebase dependencies used in Login
jest.mock('../utils/firebase', () => ({
  auth: {},
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  GoogleAuthProvider: class {},
  updateProfile: jest.fn(),
  sendPasswordResetEmail: jest.fn()
}));

describe('Login Component UI & Toggles (RTL)', () => {
  it('should render the brand header and standard form fields', () => {
    render(<Login />);
    
    // Check brand header
    expect(screen.getByText('PropIntel')).toBeInTheDocument();
    expect(screen.getByText('Property Intelligence Portal')).toBeInTheDocument();

    // Check email and password inputs
    expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    
    // Check sign in button
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('should toggle password visibility when eye icon button is clicked', () => {
    render(<Login />);
    
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    // Click show password
    const toggleButton = screen.getByTitle('Show password');
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
    expect(screen.getByTitle('Hide password')).toBeInTheDocument();

    // Click hide password
    const toggleButtonHide = screen.getByTitle('Hide password');
    fireEvent.click(toggleButtonHide);
    expect(passwordInput.type).toBe('password');
    expect(screen.getByTitle('Show password')).toBeInTheDocument();
  });

  it('should switch between sign-in and sign-up form layouts', () => {
    render(<Login />);

    // Click registration toggle
    const toggleFormBtn = screen.getByText(/Don't have an account\? Sign Up/i);
    fireEvent.click(toggleFormBtn);

    // Verify name input appears and button changes text
    expect(screen.getByPlaceholderText('e.g. John Doe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();

    // Toggle back to sign-in
    const toggleFormBtnBack = screen.getByText(/Already have an account\? Sign In/i);
    fireEvent.click(toggleFormBtnBack);
    expect(screen.queryByPlaceholderText('e.g. John Doe')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });
});
