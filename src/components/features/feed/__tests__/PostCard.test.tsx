import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PostCard } from '@/components/features/feed/PostCard'

// next/image renders an optimization wrapper that jsdom can't resolve; mock to a plain <img>.
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ''} />
  ),
}))

const baseProps = {
  id: 'post-1',
  author: { id: 'a1', name: 'Maya Rivera', username: 'maya' },
  content: 'Sunset over the rooftops 🌇',
  location: { id: 'lisbon', name: 'Lisbon' },
  timestamp: new Date('2026-06-01T10:00:00Z'),
  reactions: [{ type: 'like' as const, count: 12 }],
  commentCount: 3,
  shareCount: 1,
}

describe('PostCard', () => {
  it('renders author name, content, location, and a formatted timestamp', () => {
    render(<PostCard {...baseProps} />)
    expect(screen.getByText('Maya Rivera')).toBeInTheDocument()
    expect(screen.getByText('Sunset over the rooftops 🌇')).toBeInTheDocument()
    expect(screen.getByText('Lisbon')).toBeInTheDocument()
    // formatTimestamp emits "M/D/YYYY" for dates older than a week, not a raw Date string.
    expect(screen.getByText('6/1/2026')).toBeInTheDocument()
  })

  it('renders "Currently in [city]" when author.currentCity is set', () => {
    render(<PostCard {...baseProps} author={{ ...baseProps.author, currentCity: 'Porto' }} />)
    expect(screen.getByText('Currently in Porto')).toBeInTheDocument()
  })

  it('omits the "Currently in" line when author.currentCity is absent', () => {
    render(<PostCard {...baseProps} />)
    expect(screen.queryByText(/Currently in/)).not.toBeInTheDocument()
  })

  it('renders a "Say hi" button on every card and fires onSayHi', () => {
    const onSayHi = jest.fn()
    render(<PostCard {...baseProps} onSayHi={onSayHi} />)
    const button = screen.getByRole('button', { name: 'Say hi to Maya Rivera' })
    fireEvent.click(button)
    expect(onSayHi).toHaveBeenCalledTimes(1)
  })

  it('still renders the "Say hi" button when onSayHi is not wired (no-op)', () => {
    render(<PostCard {...baseProps} />)
    expect(screen.getByRole('button', { name: 'Say hi to Maya Rivera' })).toBeInTheDocument()
  })

  it('applies the warm accent border when isInCity is true', () => {
    const { container } = render(<PostCard {...baseProps} isInCity />)
    expect((container.firstChild as HTMLElement).className).toMatch(/ring-connection/)
  })

  it('does not apply the warm accent border when isInCity is absent', () => {
    const { container } = render(<PostCard {...baseProps} />)
    expect((container.firstChild as HTMLElement).className).not.toMatch(/ring-connection/)
  })

  it('renders photos when provided', () => {
    render(
      <PostCard {...baseProps} photos={[{ id: 'p1', url: '/img1.jpg', alt: 'rooftop view' }]} />
    )
    expect(screen.getByAltText('rooftop view')).toBeInTheDocument()
  })
})
