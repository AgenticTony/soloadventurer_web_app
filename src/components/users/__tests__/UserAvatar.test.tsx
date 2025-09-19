import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserAvatar, UserAvatarSkeleton } from '../UserAvatar';

// Mock Next.js Image component
jest.mock('next/image', () => {
  const MockedImage = ({ src, alt, onError, fill, ...props }: { src: string; alt: string; onError?: () => void; fill?: boolean; [key: string]: unknown }) => {
    return (
      <img
        src={src}
        alt={alt}
        onError={onError}
        data-fill={fill}
        {...props}
        data-testid="next-image"
      />
    );
  };
  MockedImage.displayName = 'Image';
  return MockedImage;
});

describe('UserAvatar', () => {
  const mockUser = {
    name: 'John Doe',
    avatar: 'https://example.com/avatar.jpg'
  };

  it('should render avatar with image when avatar URL is provided', () => {
    render(<UserAvatar user={mockUser} />);

    const image = screen.getByTestId('next-image');
    expect(image).toHaveAttribute('src', mockUser.avatar);
    expect(image).toHaveAttribute('alt', "John Doe's avatar");
  });

  it('should render initials when no avatar is provided', () => {
    const userWithoutAvatar = { name: 'John Doe', avatar: undefined };
    render(<UserAvatar user={userWithoutAvatar} />);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
  });

  it('should generate correct initials for different names', () => {
    const testCases = [
      { name: 'John', expected: 'J' },
      { name: 'John Doe', expected: 'JD' },
      { name: 'John Michael Doe', expected: 'JM' },
      { name: 'alice bob charlie', expected: 'AB' },
    ];

    testCases.forEach(({ name, expected }) => {
      const { unmount } = render(<UserAvatar user={{ name, avatar: undefined }} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
      unmount();
    });
  });

  it('should render different sizes correctly', () => {
    const { rerender } = render(<UserAvatar user={mockUser} size="xs" />);
    let container = screen.getByLabelText("John Doe's avatar");
    expect(container).toHaveClass('h-6', 'w-6');

    rerender(<UserAvatar user={mockUser} size="sm" />);
    container = screen.getByLabelText("John Doe's avatar");
    expect(container).toHaveClass('h-8', 'w-8');

    rerender(<UserAvatar user={mockUser} size="xl" />);
    container = screen.getByLabelText("John Doe's avatar");
    expect(container).toHaveClass('h-16', 'w-16');
  });

  it('should render status indicator when showStatus is true', () => {
    render(
      <UserAvatar
        user={mockUser}
        status="online"
        showStatus={true}
      />
    );

    const statusIndicator = screen.getByRole('status');
    expect(statusIndicator).toHaveAttribute('aria-label', 'User is online');
    expect(statusIndicator).toHaveClass('bg-green-500');
  });

  it('should render different status colors', () => {
    const { rerender } = render(
      <UserAvatar user={mockUser} status="online" showStatus={true} />
    );
    let statusIndicator = screen.getByRole('status');
    expect(statusIndicator).toHaveClass('bg-green-500');

    rerender(<UserAvatar user={mockUser} status="offline" showStatus={true} />);
    statusIndicator = screen.getByRole('status');
    expect(statusIndicator).toHaveClass('bg-gray-400');

    rerender(<UserAvatar user={mockUser} status="away" showStatus={true} />);
    statusIndicator = screen.getByRole('status');
    expect(statusIndicator).toHaveClass('bg-yellow-500');
  });

  it('should not render status indicator when showStatus is false', () => {
    render(
      <UserAvatar
        user={mockUser}
        status="online"
        showStatus={false}
      />
    );

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('should handle custom alt text', () => {
    render(<UserAvatar user={mockUser} alt="Custom alt text" />);

    const container = screen.getByLabelText('Custom alt text');
    expect(container).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<UserAvatar user={mockUser} className="custom-class" />);

    const wrapper = screen.getByLabelText("John Doe's avatar").parentElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('should handle image error and fallback to initials', () => {
    render(<UserAvatar user={mockUser} />);

    const image = screen.getByTestId('next-image');
    fireEvent.error(image);

    // After error, the image should be hidden and initials should show
    expect(image.style.display).toBe('none');
  });

  it('should have proper accessibility attributes', () => {
    render(
      <UserAvatar
        user={mockUser}
        status="online"
        showStatus={true}
      />
    );

    const avatar = screen.getByLabelText("John Doe's avatar");
    expect(avatar).toHaveAttribute('role', 'img');

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-label', 'User is online');
    expect(status).toHaveAttribute('title', 'John Doe is online');
  });
});

describe('UserAvatarSkeleton', () => {
  it('should render skeleton avatar', () => {
    const { container } = render(<UserAvatarSkeleton />);

    const skeletonContainer = container.querySelector('[aria-hidden="true"]');
    expect(skeletonContainer).toBeInTheDocument();
    expect(skeletonContainer!.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('should render status skeleton when showStatus is true', () => {
    const { container } = render(<UserAvatarSkeleton showStatus={true} />);

    const statusSkeletons = container.querySelectorAll('.animate-pulse');
    expect(statusSkeletons.length).toBeGreaterThan(1); // Avatar + status indicator
  });

  it('should not render status skeleton when showStatus is false', () => {
    const { container } = render(<UserAvatarSkeleton showStatus={false} />);

    const statusSkeletons = container.querySelectorAll('.animate-pulse');
    expect(statusSkeletons).toHaveLength(1); // Only avatar skeleton
  });

  it('should render different sizes correctly', () => {
    const { rerender, container } = render(<UserAvatarSkeleton size="xs" />);
    let skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('h-6', 'w-6');

    rerender(<UserAvatarSkeleton size="lg" />);
    skeleton = container.querySelector('.animate-pulse');
    expect(skeleton).toHaveClass('h-12', 'w-12');
  });

  it('should apply custom className', () => {
    const { container } = render(<UserAvatarSkeleton className="custom-skeleton" />);

    const skeletonContainer = container.querySelector('[aria-hidden="true"]');
    expect(skeletonContainer).toHaveClass('custom-skeleton');
  });
});