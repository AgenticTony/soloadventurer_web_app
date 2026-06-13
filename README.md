# SoloAdventurer Web App

A modern social platform for solo travelers built with Next.js 15, React 18, TypeScript, and Tailwind CSS. Featuring a Facebook-inspired three-column layout with travel-focused design patterns, comprehensive dark mode support, and robust accessibility features.

## 🎯 Key Features

- **Responsive Design**: Mobile-first approach with breakpoints for sm:640, md:768, lg:1024, xl:1280, 2xl:1536
- **Dark Mode**: Complete dark mode implementation with CSS variables
- **Accessibility**: Full keyboard navigation (J/K, /, C shortcuts), ARIA labels, focus management
- **Component Library**: Reusable React components with TypeScript typing
- **Toast System**: Context-based notification system with auto-dismiss
- **Loading States**: Skeleton screens, empty states, and error handling throughout
- **SEO Optimized**: Meta tags, structured data, and semantic HTML

## 🚀 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- AWS account with appropriate permissions (for backend integration)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/AgenticTony/soloadventurer_web_app.git
   cd soloadventurer_web_app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📚 Documentation

### Project Documentation

- [Project Overview](./docs/project/PROJECT.md) - Complete project description and setup
- [Development Standards](./docs/standards/CLAUDE.md) - Coding conventions and best practices
- [Sprint Planning](./docs/project/WEB_APP_SPRINTS.md) - 6-sprint roadmap and MVP definition
- [Sprint Index](./docs/project/WEB_APP_SPRINTS_INDEX.md) - Quick reference and tracking

### Technical Documentation

- [Architecture Standards](./docs/standards/ARCHITECTURE.md) - Technical architecture decisions
- [Code Style Guide](./docs/standards/CODESTYLE.md) - Coding conventions
- [Security Guidelines](./docs/standards/SECURITY.md) - Security requirements
- [Testing Strategy](./docs/standards/TESTING.md) - Testing approaches

### Architecture Decisions

- [GraphQL Service Selection](./docs/adr/0001-use-graphql-appsync.md)
- [Mobile Architecture](./docs/adr/0002-mobile-flutter-web-react.md)

### Sprint Documentation

- [Sprint 1: Foundations & Authentication](./docs/sprints/sprint-01-foundations.md) ✅ **COMPLETED**
  - [Final Cleanup Report](./docs/Sprint-01-Cleanup-Completion.md) - Production-ready with A- grade
- [Sprint 2: Trips & Explore Map](./docs/sprints/sprint-02-trips-map.md) 🔄 (75% complete)
- [Sprint 3: Matching & Connections](./docs/sprints/sprint-03-matching-connections.md)
- [Sprint 4: Messaging & Feed](./docs/sprints/sprint-04-messages-feed.md)
- [Sprint 5: Safety & Scaling](./docs/sprints/sprint-05-safety-scale.md)

### Technical Implementation Guides

- [Mapbox Integration Guide](./docs/MAPBOX_INTEGRATION_GUIDE.md) - Complete technical documentation for map functionality

## 🛠 Development

### Available Scripts

| Command              | Description                                |
| -------------------- | ------------------------------------------ |
| `npm run dev`        | Start development server on localhost:3000 |
| `npm run build`      | Build for production with optimization     |
| `npm run start`      | Start production server                    |
| `npm run lint`       | Run ESLint with Next.js rules              |
| `npm run typecheck`  | TypeScript type checking                   |
| `npm run test`       | Run Jest tests                             |
| `npm run test:watch` | Run tests in watch mode                    |
| `npm run e2e`        | Run Cypress end-to-end tests               |
| `npm run deploy`     | Build and deploy application               |

### Technology Stack

- **Frontend**: Next.js 15 (App Router), React 18.2, TypeScript 5.9
- **Styling**: TailwindCSS 3.4 with custom theme, shadcn/ui components
- **State Management**: React Context, Apollo Client for GraphQL
- **Icons**: Lucide React
- **Animation**: Framer Motion
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest, Testing Library, Cypress
- **Backend**: AWS AppSync (GraphQL), Amplify Auth
- **Database**: Amazon Aurora (MySQL-compatible)

## 🎨 Design System

### Color Palette

The app uses a travel-inspired color system with carefully chosen hex values:

**Primary Colors:**

- Brand: `#3B82F6` (Blue)
- Coral: `#F97316` (Orange)
- Sun: `#FCD34D` (Yellow)
- Forest: `#10B981` (Green)
- Sky: `#06B6D4` (Cyan)

**Dark Mode Support:**

- All colors have corresponding dark mode variants using CSS variables
- Automatic theme switching based on system preference
- Manual theme toggle in user settings

### Typography

- **Primary**: Inter (system font stack)
- **Monospace**: JetBrains Mono (for code)
- Responsive typography with fluid scaling

### Spacing Scale

- Custom spacing scale optimized for travel content
- 8px base unit with responsive adjustments
- Mobile-first approach with progressive enhancement

## 📱 Responsive Breakpoints

| Breakpoint | Width   | Columns | Features                             |
| ---------- | ------- | ------- | ------------------------------------ |
| Base       | < 640px | 1       | Mobile navigation, simplified layout |
| sm         | 640px+  | 1       | Tablet-optimized                     |
| md         | 768px+  | 2       | Desktop: Feed + Sidebar              |
| lg         | 1024px+ | 3       | Full: Left Rail + Feed + Right Rail  |
| xl         | 1280px+ | 3       | Enhanced spacing and content         |
| 2xl        | 1536px+ | 3       | Maximum content width                |

## ⌨️ Keyboard Shortcuts

| Shortcut        | Action        | Description               |
| --------------- | ------------- | ------------------------- |
| `⌘K` / `Ctrl+K` | Search        | Open omnibox search       |
| `⌘N` / `Ctrl+N` | New Post      | Create new post           |
| `⌘M` / `Ctrl+M` | Messages      | Open messages             |
| `⌘A` / `Ctrl+A` | Notifications | View notifications        |
| `⌘P` / `Ctrl+P` | Profile       | Go to profile             |
| `⌘,` / `Ctrl+,` | Settings      | Open settings             |
| `?`             | Help          | Show keyboard shortcuts   |
| `J`             | Next          | Navigate to next item     |
| `K`             | Previous      | Navigate to previous item |
| `L`             | Like          | Like current item         |
| `C`             | Comment       | Comment on current item   |
| `⌘S` / `Ctrl+S` | Share         | Share current item        |

## 📋 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authenticated routes
│   │   ├── layout.tsx     # Auth layout wrapper
│   │   ├── sign-in/        # Sign in page
│   │   └── sign-up/       # Sign up page
│   ├── (main)/            # Main app routes
│   │   ├── layout.tsx     # Main layout with 3-column design
│   │   ├── page.tsx       # Home/feed page
│   │   ├── cities/        # City hubs
│   │   ├── messages/      # Messaging interface
│   │   ├── notifications/ # Notifications
│   │   ├── profile/       # User profiles
│   │   ├── trips/         # Trip management
│   │   └── explore/       # Explore map
│   ├── globals.css        # Global styles and CSS variables
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── layout/           # Layout components
│   │   ├── MainLayout.tsx    # Main 3-column layout
│   │   └── BottomTabBar.tsx  # Mobile navigation
│   ├── features/         # Feature-specific components
│   │   ├── feed/         # Feed components
│   │   │   ├── PostComposer.tsx  # Post creation
│   │   │   ├── PostCard.tsx      # Post display
│   │   │   ├── PhotoGrid.tsx     # Photo gallery
│   │   │   └── CommentThread.tsx # Comments
│   │   ├── cities/       # City hub components
│   │   │   └── CityModule.tsx    # City info widget
│   │   ├── users/        # User components
│   │   │   └── UserMiniCard.tsx   # User profile card
│   │   ├── trips/        # Trip components
│   │   │   └── TripCard.tsx      # Trip display
│   │   └── search/       # Search components
│   │       └── SearchOmni.tsx     # Omnibox search
│   └── ui/               # UI primitives and utilities
│       ├── skeletons.tsx        # Loading states
│       ├── toast.tsx           # Toast notifications
│       └── withLoadingState.tsx # Loading HOC
├── contexts/             # React contexts
│   ├── LayoutContext.tsx  # Layout state management
│   └── ToastContext.tsx   # Toast notifications
├── hooks/                # Custom React hooks
│   ├── useKeyboardNavigation.ts  # Keyboard shortcuts
│   └── useLoadingState.ts        # Loading states
├── lib/                  # External libraries
│   └── utils.ts          # Utility functions
├── styles/               # Style files
│   └── globals.css       # Global CSS with theme variables
└── types/                # TypeScript type definitions
    └── index.ts          # Core types
```

## 🔧 Core Components

### Layout Components

- **MainLayout**: Three-column responsive layout with header, left rail, center feed, and right rail
- **BottomTabBar**: Mobile navigation with 5 primary actions

### Feature Components

- **PostComposer**: Rich post creation with drag-and-drop media support
- **PostCard**: Post display with photo grids, engagement metrics, and comment threads
- **CityModule**: City information widget with weather and trending spots
- **UserMiniCard**: User profile display with follow functionality
- **TripCard**: Trip display with status tracking and progress indicators
- **SearchOmni**: Omnibox search with keyboard shortcuts and filters
- **PhotoGrid**: Responsive photo gallery with lightbox support
- **CommentThread**: Nested comment system with replies and reactions

### UI Components

- **Skeletons**: Loading states for all major components
- **Toast**: Context-based notification system
- **withLoadingState**: Higher-order component for loading management

## 🎯 Pages & Routes

### Authentication

- `/sign-in` - Sign in form with social options
- `/sign-up` - Sign up form with validation

### Main App

- `/` - Home feed with PostComposer and posts
- `/cities/[slug]` - Dynamic city hub pages
- `/messages` - Split-view messaging interface
- `/notifications` - Filtered notification center
- `/profile/[username]` - Dynamic user profiles
- `/trips` - Trip management dashboard
- `/explore` - Interactive travel map

## 🔄 State Management

### React Context

- **LayoutContext**: Layout-level state (active nav, user data)
- **ToastContext**: Global toast notifications

### Apollo Client

- GraphQL queries and mutations
- Local state management
- Caching strategies

## 🧪 Testing

### Unit Tests

- Jest for unit testing
- React Testing Library for component tests
- Coverage reporting

### E2E Tests

- Cypress for end-to-end testing
- Critical user journey testing
- Cross-browser testing

### Performance Testing

- Lighthouse integration
- Bundle analysis
- Core Web Vitals monitoring

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm run start
```

### Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy on push to main branch

### AWS Deployment

```bash
npm run deploy
```

## 🔒 Security

### Authentication

- AWS Amplify + Cognito
- Social sign-in options
- Multi-factor authentication support

### Data Protection

- HTTPS everywhere
- Input validation and sanitization
- XSS protection
- CSRF protection

### Privacy

- GDPR compliance
- User data controls
- Activity logging

## 🌍 Accessibility

### WCAG 2.1 AA Compliance

- Semantic HTML structure
- ARIA labels and descriptions
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Focus management

### Features

- Full keyboard navigation with shortcuts
- Screen reader announcements
- High contrast mode support
- Reduced motion preferences
- Large text support

## 📈 Performance

### Optimization

- Image optimization with Next.js Image
- Code splitting and lazy loading
- Bundle size analysis
- Caching strategies
- Progressive enhancement

### Monitoring

- Core Web Vitals tracking
- Performance budgets
- Error tracking
- User analytics

## 🤝 Contributing

We welcome contributions! Please follow our guidelines:

1. **Code of Conduct** - [Read here](./docs/project/CODE_OF_CONDUCT.md)
2. **Development Standards** - [CLAUDE.md](./docs/standards/CLAUDE.md)
3. **Issue Templates** - Available in `.github/ISSUE_TEMPLATE/`
4. **Pull Request Template** - [Template](./.github/PULL_REQUEST_TEMPLATE.md)

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

**Build Errors**

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**TypeScript Errors**

```bash
# Clear TypeScript cache
npm run typecheck -- --force
```

**Port Already in Use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Environment Setup

- Ensure Node.js 18.0.0+ is installed
- Check that all dependencies are installed
- Verify environment variables are set correctly

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an [issue](https://github.com/AgenticTony/soloadventurer_web_app/issues)
- Check our [documentation](./docs/)
- Join our community discussions
- Email: support@soloadventurer.com

---

**Built with ❤️ by the SoloAdventurer Team**  
_Connecting solo travelers worldwide since 2024_

---

## 📊 Project Status

**Current Sprint**: Sprint 2 - Trips & Explore Map 🔄 (75% complete)
**Sprint 1**: ✅ **COMPLETED** with A- grade - Production ready!
**Major Milestone**: Interactive map with location services ✅
**MVP Target**: Q4 2024

### Sprint 1 - Completed & Production Ready ✅

- ✅ **Performance Optimized**: All images converted to Next.js Image components
- ✅ **Type Safe**: Zero TypeScript `any` types in core components
- ✅ **Code Quality**: ESLint warnings reduced from 47+ to 43 (non-critical)
- ✅ **React Best Practices**: All hooks dependencies properly configured
- ✅ **Accessibility**: Screen reader support and semantic HTML
- ✅ **Design system** with Tailwind CSS
- ✅ **Responsive 3-column layout**
- ✅ **Authentication flow** with AWS Cognito
- ✅ **Core components** (Post, User, City, Trip)
- ✅ **Toast notification system**
- ✅ **Keyboard navigation**
- ✅ **Dark mode support**
- ✅ **Interactive explore map** with Mapbox GL JS
- ✅ **User location detection** and navigation
- ✅ **Trip visualization** with marker clustering

### In Progress

- 🚧 Trip CRUD operations and management UI
- 🚧 Backend integration (AWS AppSync)
- 🚧 Real-time messaging
- 🚧 Advanced map search and filtering

### Upcoming Features

- 📅 Real-time location sharing
- 📅 Group trip coordination
- 📅 Safety features (SOS, check-ins)
- 📅 AI-powered travel recommendations
- 📅 Social matching algorithm
- 📅 Event discovery and planning
