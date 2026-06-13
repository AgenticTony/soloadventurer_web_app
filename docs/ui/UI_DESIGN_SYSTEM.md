# SoloAdventurer UI Design System

A comprehensive design system and component library for the SoloAdventurer web application, featuring a Facebook-inspired layout with travel-friendly aesthetics.

## 🎨 Design Overview

### Brand Identity

- **Personality**: Adventurous, welcoming, reliable, light, outdoorsy
- **Layout**: Facebook-inspired three-column layout (not a clone)
- **Colors**: Teal-based palette with warm, travel-inspired accents
- **Aesthetics**: Clean, modern, accessible, and responsive

## 🏗️ Layout System

### Main Layout (`MainLayout`)

Facebook-inspired three-column responsive layout:

```
┌─────────────────────────────────────────────────────────┐
│                     Header (64px)                       │
├─────────┬─────────────────────────┬─────────────────────┤
│         │                         │                     │
│  Left   │      Center Feed        │      Right Rail     │
│  Rail   │     (max-width 720px)   │      (320px)        │
│ (280px) │                         │                     │
│         │                         │                     │
├─────────┴─────────────────────────┴─────────────────────┤
│                  Mobile Navigation                    │
└─────────────────────────────────────────────────────────┘
```

#### Responsive Breakpoints

- **≥1280px**: Full three-column layout
- **<1280px**: Right rail collapses
- **<1024px**: Left rail becomes collapsible, single column main content
- **<768px**: Mobile bottom navigation, floating create button

### Components Hierarchy

```
MainLayout
├── Header (sticky, 64px)
├── Left Rail (280px, hidden <1024px)
│   ├── UserMiniCard
│   ├── Navigation
│   └── Quick Links
├── Center Feed (max-width 720px)
│   ├── PostComposer (sticky)
│   └── PostCard[]
├── Right Rail (320px, hidden <1280px)
│   ├── CityModule
│   ├── Nearby Travelers
│   └── Upcoming Trips
└── BottomTabBar (mobile only)
```

## 🎨 Color System

### Brand Colors

```css
:root {
  --brand-50: #ecfeff; /* Misty aqua */
  --brand-500: #14b8a6; /* Primary teal */
  --brand-600: #0f766e; /* Dark teal */
}
```

### Accent Colors

```css
:root {
  --sun-500: #f59e0b; /* Sun/sand */
  --coral-500: #fb7185; /* Coral accent */
  --sky-500: #0ea5e9; /* Sky blue */
}
```

### Neutral Colors

```css
:root {
  --ink-900: #0f172a; /* Darkest text */
  --ink-700: #334155; /* Medium text */
  --ink-500: #64748b; /* Light text */
  --paper: #f8fafc; /* Background */
  --card: #ffffff; /* Card background */
}
```

### Dark Mode

```css
.dark {
  --background: #0b1220; /* Dark page */
  --card: #0f172a; /* Dark card */
  --foreground: #e5e7eb; /* Light text */
}
```

## 📱 Components

### Feed Components

#### PostComposer

- **Purpose**: Create travel posts with text, photos, and metadata
- **Features**:
  - Rich text input with placeholder
  - Drag-and-drop image upload (max 4 images)
  - Smart photo grid preview
  - Action buttons: Add Photos, Tag City, Add Trip, Feeling
  - Validation and loading states

```tsx
<PostComposer
  user={currentUser}
  onPost={(content, images, location) => handlePost(content, images, location)}
/>
```

#### PostCard

- **Purpose**: Display user posts with interactions
- **Features**:
  - User avatar, name, location, timestamp
  - Rich text content with links
  - Photo grid (1-4 images with intelligent layouts)
  - Reactions: Like ❤️, Love, Globe 🌍, Helpful, Wow
  - Comment and share actions
  - Stats display

**Photo Grid Layouts**:

- 1 photo: Full-width, aspect-ratio preserved
- 2 photos: Side-by-side squares
- 3 photos: Large left + two stacked right
- 4 photos: 2x2 grid

```tsx
<PostCard
  author={post.author}
  content={post.content}
  images={post.images}
  location={post.location}
  timestamp={post.timestamp}
  likes={post.likes}
  comments={post.comments}
  shares={post.shares}
/>
```

### City Components

#### CityModule

- **Purpose**: Display current city information and travel context
- **Features**:
  - Current city weather widget
  - Traveler count and trending spots
  - Tabbed interface: Spots, Events, Travelers
  - Upcoming events with attendance
  - Active traveler list

```tsx
<CityModule
  city={{
    name: "San Francisco",
    country: "United States",
    temperature: 68,
    weather: "Partly Cloudy",
    travelersCount: 234,
    trendingSpots: ["Golden Gate Bridge", "Fisherman's Wharf"],
    upcomingEvents: [...]
  }}
/>
```

### User Components

#### UserMiniCard

- **Purpose**: Display user profile information
- **Features**:
  - Compact and full variants
  - Avatar, name, location
  - Travel stats (trips, connections, posts)
  - Languages and travel styles
  - Upcoming trip information
  - Follow/Message actions

```tsx
<UserMiniCard
  user={{
    name: 'Sarah Chen',
    location: 'San Francisco, CA',
    languages: ['English', 'Mandarin'],
    travelStyles: ['Adventure', 'Cultural'],
    stats: { trips: 12, connections: 89, posts: 45 },
  }}
/>
```

### Navigation Components

#### BottomTabBar

- **Purpose**: Mobile navigation with expandable menu
- **Features**:
  - Main tabs: Feed, Cities, Messages, Buddies
  - Floating create post button
  - Expandable "More" menu
  - Badge notifications
  - Responsive animations

```tsx
<BottomTabBar
  activeTab="feed"
  onTabChange={setActiveTab}
  onCreatePost={() => setShowComposer(true)}
  unreadMessages={3}
  unreadNotifications={7}
/>
```

## 🎯 Design Patterns

### Spacing System

```css
spacing: {
  '4.5': '1.125rem',  /* 18px */
  '18':   '4.5rem',   /* 72px */
  '88':   '22rem',    /* 352px */
  '90':   '22.5rem',  /* 360px */
  '96':   '24rem',    /* 384px */
  '128':  '32rem'     /* 512px */
}
```

### Shadow System

```css
shadow: {
  'card':       '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  'card-hover': '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  'header':     '0 1px 3px 0 rgb(0 0 0 / 0.1)'
}
```

### Border Radius

```css
borderRadius: {
  '2xl':'1.5rem',/* Default card radius */
  '3xl': '2rem'; /* Large radius */
}
```

## 🔧 Usage Examples

### Basic Feed Page

```tsx
export default function FeedPage() {
  return (
    <MainLayout user={currentUser}>
      <PostComposer user={currentUser} onPost={handlePost} />
      {posts.map(post => (
        <PostCard key={post.id} {...post} />
      ))}
      <BottomTabBar activeTab="feed" onTabChange={setActiveTab} />
    </MainLayout>
  )
}
```

### Theme Customization

```css
/* Override brand colors */
:root {
  --brand-500: #10b981; /* Change to emerald */
  --brand-600: #059669; /* Darker emerald */
}

/* Add custom spacing */
.theme-spacing {
  --spacing-128: 32rem;
}
```

## ♿ Accessibility Features

### Keyboard Navigation

- `Tab` - Navigate interactive elements
- `J/K` - Next/previous post
- `/` - Focus search
- `C` - Compose new post
- `Escape` - Close modals/menus

### Screen Reader Support

- Semantic HTML5 structure
- ARIA labels and roles
- Focus management
- Screen reader-only text
- Alt text for images

### Color Contrast

- All text meets WCAG AA+ contrast ratios
- Interactive elements have 3:1 minimum contrast
- Focus indicators are clearly visible

## 🚀 Integration Guide

### Setup Components

1. Install dependencies:

```bash
npm install lucide-react @radix-ui/react-slot class-variance-authority clsx tailwind-merge
```

2. Configure Tailwind:

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  // ... rest of config
}
```

3. Import styles:

```tsx
import '@/styles/globals.css'
```

### Component Props

All components follow TypeScript interfaces with proper typing:

```typescript
interface PostCardProps {
  author: {
    name: string
    avatar?: string
    location?: string
  }
  content: string
  images?: string[]
  location?: string
  timestamp: string
  likes: number
  comments: number
  shares: number
  onLike?: () => void
  onComment?: () => void
  onShare?: () => void
}
```

## 📱 Responsive Behavior

### Desktop (≥1280px)

```
[280px][Center Feed][320px]
  Left     Main      Right
  Rail     Feed      Rail
```

### Tablet (768px - 1279px)

```
[Center Feed][Optional Rail]
```

### Mobile (<768px)

```
[Full Width Feed]
[Bottom Navigation]
```

## 🎨 Demo Pages

### Theme Preview (`/theme-preview`)

- Complete color palette showcase
- Component examples
- Typography samples
- Interactive element demos

### Feed Demo (`/feed`)

- Full layout implementation
- Working post composer
- Sample posts with photos
- City modules and user cards

## 🚀 Best Practices

1. **Consistency**: Use design tokens for colors, spacing, and shadows
2. **Accessibility**: Always include proper ARIA labels and keyboard navigation
3. **Performance**: Optimize images and use lazy loading
4. **Responsive**: Test on all breakpoint sizes
5. **Animation**: Keep transitions subtle (150-250ms)
6. **Typography**: Maintain readable contrast ratios

## 📝 Changelog

### v1.0.0

- Initial design system implementation
- Core layout components
- Feed components (PostComposer, PostCard)
- City and user components
- Mobile navigation
- Dark mode support
- Accessibility features
