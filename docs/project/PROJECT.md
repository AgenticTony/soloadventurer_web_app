# SoloAdventurer - Social Platform for Solo Travelers

## Project Overview

SoloAdventurer is a social platform designed specifically for solo travelers to connect, share experiences, and find travel companions. The platform includes both a web application and a mobile application that share backend services and data.

## Features

- **User Profiles**: Create detailed traveler profiles with interests, travel history, and preferences
- **Trip Planning**: Plan and share travel itineraries with dates, locations, and activities
- **Map-Based Discovery**: Discover other travelers and destinations through an interactive map
- **Matching System**: Connect with compatible travelers based on interests and travel plans
- **Real-time Messaging**: Chat with matched travelers securely
- **Social Feed**: Share travel experiences, photos, and updates
- **Meetup Organization**: Plan and organize in-person meetups during travels
- **Safety Features**: Comprehensive verification, reporting, and blocking systems

## Technology Stack

### Frontend (Web)

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.2 with strict mode
- **Styling**: TailwindCSS 3.4 with shadcn/ui components
- **State Management**: React Context, Zustand, Apollo Client
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Infrastructure

- **API**: GraphQL with AWS AppSync
- **Authentication**: AWS Cognito + Amplify
- **Database**: Amazon Aurora (MySQL-compatible) with read replicas
- **Cache**: Redis ElastiCache for performance
- **Storage**: S3 for media files with CloudFront CDN
- **Real-time**: GraphQL subscriptions and WebSockets
- **Infrastructure**: Terraform for IaC
- **CI/CD**: GitHub Actions

### Development Tools

- **Code Quality**: ESLint + TypeScript strict mode
- **Testing**: Jest + Testing Library + Cypress
- **Package Management**: npm

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/            # Base shadcn/ui components
│   ├── layout/        # Layout components (Header, Sidebar)
│   └── features/      # Feature-specific components
├── pages/             # Next.js page routes
├── hooks/             # Custom React hooks
├── services/          # API services and clients
├── utils/             # Utility functions
├── types/             # TypeScript type definitions
└── styles/            # Global styles and theme
```

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- AWS account with appropriate permissions

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

### Available Scripts

| Command             | Description              |
| ------------------- | ------------------------ |
| `npm run dev`       | Start development server |
| `npm run build`     | Build for production     |
| `npm run start`     | Start production server  |
| `npm run lint`      | Run ESLint               |
| `npm run typecheck` | Type checking            |
| `npm run test`      | Run tests                |
| `npm run deploy`    | Deploy application       |

### Development Workflow

1. **Create a new branch** for your feature or bugfix

   ```bash
   git checkout -b feature/S##-T##-short-description
   ```

2. **Make your changes** following the coding standards

3. **Run quality checks**

   ```bash
   npm run lint && npm run typecheck && npm run test
   ```

4. **Commit your changes** with conventional commit messages

   ```bash
   git commit -m "feat: add user authentication"
   ```

5. **Push to GitHub** and create a pull request

## Architecture

### Clean Architecture

The application follows clean architecture principles with distinct layers:

- **Presentation Layer**: Next.js components and pages
- **Application Layer**: Business logic and use cases
- **Domain Layer**: Core business entities and rules
- **Infrastructure Layer**: External services and databases

### GraphQL Schema

The application uses a schema-first GraphQL approach:

1. Define GraphQL schema in `schema.graphql`
2. Generate TypeScript types using codegen
3. Implement resolvers following the schema
4. Optimize queries with DataLoader for N+1 prevention

### Security

- **Authentication**: AWS Cognito JWT tokens
- **Authorization**: IAM roles + GraphQL resolver authorization
- **Data Encryption**: KMS for encryption at rest and in transit
- **Input Validation**: Zod schemas for API validation
- **CORS**: Configured for trusted domains only

## Testing Strategy

### Unit Tests

- Test all business logic and utility functions
- Target 80%+ code coverage
- Use Jest with TypeScript support

### Component Tests

- Test React components with Testing Library
- Verify rendering, user interactions, and accessibility

### End-to-End Tests

- Test critical user flows with Cypress
- Cover authentication, trip creation, messaging, and safety features

## Deployment

### Infrastructure

Infrastructure is managed using Terraform:

```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

### Application

The application is deployed using Amplify or equivalent pipeline:

```bash
npm run build
npm run deploy
```

## Contributing

We welcome contributions! Please see our contributing guidelines:

1. Follow the [Code of Conduct](./CODE_OF_CONDUCT.md)
2. Use the provided [issue templates](./.github/ISSUE_TEMPLATE/)
3. Follow the [pull request template](./.github/PULL_REQUEST_TEMPLATE.md)
4. Adhere to coding standards in [CLAUDE.md](../standards/CLAUDE.md)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:

- Create an [issue](https://github.com/AgenticTony/soloadventurer_web_app/issues)
- Check our [documentation](./docs/)
- Join our community discussions

## Roadmap

See [WEB_APP_SPRINTS.md](./WEB_APP_SPRINTS.md) for our development roadmap and sprint planning.

---

**SoloAdventurer Team**  
_Connecting solo travelers worldwide_
