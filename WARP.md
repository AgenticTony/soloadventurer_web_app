# SoloAdventurer Project Rules (WARP.md)

## 🎯 Project Overview
SoloAdventurer is a social platform for solo travelers built with Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, and AWS Amplify. The UI follows a Facebook-inspired 3-column layout with travel-friendly aesthetics.

## 🚫 Forbidden Actions
1. **NEVER** modify the existing AWS Amplify configuration without explicit permission
2. **NEVER** commit sensitive data (API keys, secrets) to the repository
3. **NEVER** use inline styles - always use Tailwind classes
4. **NEVER** create components without TypeScript interfaces
5. **NEVER** skip accessibility requirements (ARIA labels, keyboard navigation)

## ✅ Mandatory Conventions

### Code Style
- Use TypeScript strict mode for all files
- Follow ESLint and Prettier configurations already in place
- Component files: PascalCase (e.g., `PostCard.tsx`)
- Hook files: camelCase with 'use' prefix (e.g., `usePresignedUpload.ts`)
- CSS classes: Use Tailwind utility classes with semantic grouping

### Component Structure
```tsx
// Required structure for all components
interface ComponentNameProps {
  // All props must be typed
}

export function ComponentName({ props }: ComponentNameProps) {
  // Implementation
}
```

### Git Conventions
- Branch naming: `feature/description`, `fix/description`, `chore/description`
- Commit messages: Follow conventional commits (feat:, fix:, chore:, docs:)
- Always create feature branches from `main`
- PR required for all merges to `main`

### File Organization
```
src/
  app/            # Next.js app router pages
    (main)/       # Authenticated routes group
    (auth)/       # Auth routes group
  components/     # Reusable components
    ui/          # shadcn/ui base components
    layout/      # Layout components
    features/    # Feature-specific components
  lib/           # Utilities and configurations
  hooks/         # Custom React hooks
  types/         # TypeScript type definitions
```

## 🎨 Design System Rules

### Colors
- Always use CSS variables for colors (defined in globals.css)
- Light mode: Use `--brand-500` for primary actions
- Dark mode: Use `--brand-400` for primary actions
- Maintain AA contrast ratios for all text

### Spacing
- Use Tailwind spacing scale consistently
- Card padding: `p-6` (desktop), `p-4` (mobile)
- Section spacing: `space-y-6`
- Component gaps: `gap-4`

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Test all components at each breakpoint

## 🔧 Technical Requirements

### Performance
- Lazy load images with Next.js Image component
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Target LCP < 2.5s, FID < 100ms, CLS < 0.1

### Accessibility
- All interactive elements must have focus states
- Keyboard navigation for all features
- Screen reader announcements for dynamic content
- Color contrast minimum AA (4.5:1 for normal text)

### State Management
- Use React Context for global state (Auth, Theme)
- Local component state with useState/useReducer
- Server state with Apollo Client
- Form state with react-hook-form

## 🔄 Development Workflow

### Before Starting Work
1. Pull latest from `main`
2. Create feature branch
3. Check existing UI Design System docs
4. Review similar components for patterns

### During Development
1. Run tests frequently: `npm test`
2. Check TypeScript: `npm run typecheck`
3. Lint code: `npm run lint`
4. Test responsive behavior
5. Verify accessibility

### Before Committing
1. Run all tests
2. Fix all TypeScript errors
3. Fix all ESLint warnings
4. Update documentation if needed
5. Test in both light and dark modes

## 📦 Dependencies

### Approved Libraries
- UI: shadcn/ui, lucide-react, framer-motion
- Forms: react-hook-form, zod
- State: @apollo/client, aws-amplify
- Utils: clsx, tailwind-merge, date-fns

### Registry Usage
When using MCP registries:
1. Prefer Origin UI for navigation components
2. Use Aceternity UI for animated components
3. Use Magic UI for complex interactions
4. Always adapt imported components to match our design tokens

## 🚀 Deployment

### Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_AWS_REGION=
NEXT_PUBLIC_USER_POOL_ID=
NEXT_PUBLIC_USER_POOL_CLIENT_ID=
NEXT_PUBLIC_IDENTITY_POOL_ID=
NEXT_PUBLIC_GRAPHQL_ENDPOINT=
NEXT_PUBLIC_GRAPHQL_API_KEY=
```

### Build Checklist
- [ ] All tests pass
- [ ] TypeScript builds without errors
- [ ] Lighthouse scores meet targets
- [ ] Responsive on all breakpoints
- [ ] Works in latest Chrome, Firefox, Safari
- [ ] Accessibility audit passes

## 📝 Documentation

### Required for New Features
1. Component props documentation with JSDoc
2. Usage examples in component file
3. Update UI Design System doc if needed
4. Add to Storybook (when implemented)

### Code Comments
- Comment complex logic
- Document workarounds with reason
- Add TODO with ticket number for tech debt

## ⚠️ Security

### Client-Side
- Sanitize all user inputs
- Use Content Security Policy headers
- Implement rate limiting for API calls
- Validate file uploads (type, size)

### Authentication
- All routes except /(auth)/* require authentication
- Use Amplify Auth for all auth operations
- Store tokens securely (httpOnly cookies preferred)
- Implement session timeout

## 🐛 Error Handling

### User-Facing Errors
- Show friendly error messages
- Provide actionable next steps
- Log errors to monitoring service
- Never expose technical details

### Development Errors
- Use Error Boundaries for component errors
- Log GraphQL errors with context
- Handle network failures gracefully
- Implement retry logic for transient failures

---

**Remember**: This document is the source of truth for project conventions. When in doubt, refer here first. If something is unclear, ask for clarification before proceeding.