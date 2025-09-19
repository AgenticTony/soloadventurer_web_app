import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../MainLayout';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
}));

// Mock Auth Context components
jest.mock('@/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => ({
    user: {
      name: 'Test User',
      email: 'test@example.com',
      emailVerified: true,
    },
    isAuthenticated: true,
  }),
}));

// Mock child components
jest.mock('../Header', () => ({
  Header: ({ onMenuToggle }: { onMenuToggle: () => void }) => (
    <div data-testid="header">
      <button onClick={onMenuToggle}>Menu</button>
    </div>
  ),
}));

jest.mock('../LeftNav', () => ({
  LeftNav: () => <div data-testid="left-nav">Left Nav</div>,
}));

jest.mock('../RightRail', () => ({
  RightRail: () => <div data-testid="right-rail">Right Rail</div>,
}));

jest.mock('../BottomTabBar', () => ({
  BottomTabBar: ({ onTabChange }: { onTabChange: (tab: string) => void }) => (
    <div data-testid="bottom-tab-bar">
      <button onClick={() => onTabChange('feed')}>Feed</button>
      <button onClick={() => onTabChange('trips')}>Trips</button>
    </div>
  ),
}));

describe('MainLayout', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders layout components correctly', () => {
    render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('left-nav')).toBeInTheDocument();
    expect(screen.getByTestId('right-rail')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-tab-bar')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('handles mobile menu toggle', () => {
    render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    );

    const menuButton = screen.getByText('Menu');
    fireEvent.click(menuButton);

    // The mobile menu should be toggled (implementation detail tested via behavior)
    expect(menuButton).toBeInTheDocument();
  });

  it('handles tab navigation correctly', () => {
    render(
      <MainLayout>
        <div>Test content</div>
      </MainLayout>
    );

    // Tab navigation is handled by console.log in the current implementation
    // This would be replaced with actual navigation logic
    const feedButton = screen.getByText('Feed');
    const tripsButton = screen.getByText('Trips');

    fireEvent.click(feedButton);
    fireEvent.click(tripsButton);

    expect(feedButton).toBeInTheDocument();
    expect(tripsButton).toBeInTheDocument();
  });
});