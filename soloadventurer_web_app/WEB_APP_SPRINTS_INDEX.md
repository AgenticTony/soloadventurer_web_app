# WEB_APP_SPRINTS.md

**SoloAdventurer – Web Application**
**Master Sprint Index** (MVP Phase)

> **Note**: This is the master sprint index. For detailed task breakdowns, see individual sprint files linked below.

---

## 📌 Sprint Index

| Status | Sprint | Dates | Focus | Details |
|--------|--------|-------|-------|---------|
| [ ] | **Sprint 1** | 2025-09-15 → 2025-10-03 | Foundations & Auth | [📋 sprint-01-foundations.md](./docs/sprints/sprint-01-foundations.md) |
| [ ] | **Sprint 2** | 2025-10-06 → 2025-10-24 | Trips & Explore Map | [📋 sprint-02-trips-map.md](./docs/sprints/sprint-02-trips-map.md) |
| [ ] | **Sprint 3** | 2025-10-27 → 2025-11-14 | Matching & Connections | [📋 sprint-03-matching-connections.md](./docs/sprints/sprint-03-matching-connections.md) |
| [ ] | **Sprint 4** | 2025-11-17 → 2025-12-05 | Messaging & Feed | [📋 sprint-04-messages-feed.md](./docs/sprints/sprint-04-messages-feed.md) |
| [ ] | **Sprint 5** | 2025-12-08 → 2025-12-26 | Safety & Scaling | [📋 sprint-05-safety-scale.md](./docs/sprints/sprint-05-safety-scale.md) |
| [ ] | **Sprint 6** | 2025-12-29 → 2026-01-16 | Polish & Internationalization | [📋 sprint-06-polish-i18n.md](./docs/sprints/sprint-06-polish-i18n.md) |

---

## 📋 Sprint Overview

### Sprint 1 — Foundations & Authentication
**Goal**: Ship project scaffold, auth, basic profile setup, and CI/CD  
**Key Deliverables**: Next.js app, Amplify auth, S3 uploads, CI/CD pipeline

### Sprint 2 — Trips & Explore Map  
**Goal**: Ship trip management and interactive map with traveler discovery  
**Key Deliverables**: Trip CRUD, Google Maps integration, traveler clustering

### Sprint 3 — Matching & Connections
**Goal**: Ship AI matching and consent-based connection system  
**Key Deliverables**: Matching algorithm, wave system, notifications

### Sprint 4 — Messaging & Feed
**Goal**: Ship real-time messaging and social feed  
**Key Deliverables**: Chat system, infinite scroll feed, presence indicators

### Sprint 5 — Safety & Scaling
**Goal**: Ship safety features and prepare for production scale  
**Key Deliverables**: Moderation tools, Redis caching, load testing

### Sprint 6 — Polish & Internationalization
**Goal**: Final polish and multi-language support  
**Key Deliverables**: Dark mode, accessibility, i18n support

---

## 📊 Project Timeline

**Total Duration**: 24 weeks (6 months)  
**MVP Target**: Sprint 5 completion (20 weeks)  
**Polish Phase**: Sprint 6 (4 weeks)

---

## 🔗 Quick Links

### Documentation
- [📖 Project Overview](./PROJECT.md)
- [🏗 Architecture Standards](./docs/standards/ARCHITECTURE.md)
- [💻 Code Style Guide](./docs/standards/CODESTYLE.md)
- [🧪 Testing Standards](./docs/standards/TESTING.md)
- [🔒 Security Standards](./docs/standards/SECURITY.md)

### Architecture Decisions
- [ADR-0001: Use AWS AppSync for GraphQL API](./docs/adr/0001-use-graphql-appsync.md)
- [ADR-0002: Technology Stack for Mobile and Web](./docs/adr/0002-mobile-flutter-web-react.md)

### Templates
- [🔧 Pull Request Template](./.github/PULL_REQUEST_TEMPLATE.md)
- [🐛 Bug Report Template](./.github/ISSUE_TEMPLATE/bug.yaml)
- [✨ Feature Request Template](./.github/ISSUE_TEMPLATE/feature.yaml)
- [📋 Task Template](./.github/ISSUE_TEMPLATE/task.yaml)

---

## 🎯 Success Metrics

### Foundation Phase (Sprints 1-2)
- [ ] Authentication system working across all platforms
- [ ] Users can create and manage trips
- [ ] Map displays travelers with clustering
- [ ] Basic CI/CD pipeline operational

### Core Features (Sprints 3-4)
- [ ] Matching algorithm returns relevant users
- [ ] Wave system works bidirectionally
- [ ] Real-time messaging between matched users
- [ ] Social feed with infinite scroll

### Production Ready (Sprints 5-6)
- [ ] Safety features (report, block) implemented
- [ ] System handles 10k concurrent users
- [ ] Admin moderation tools functional
- [ ] Multi-language support available

---

## 🚀 Getting Started

1. **Read the Project Overview**: [PROJECT.md](./PROJECT.md)
2. **Review Current Sprint**: Check the status above and click the relevant sprint link
3. **Setup Development Environment**: Follow the sprint-specific setup instructions
4. **Create Issues**: Use the provided templates for bugs, features, and tasks
5. **Submit Pull Requests**: Follow the PR template and link to relevant issues

---

## 📞 Support

- **Technical Questions**: Create an issue using the task template
- **Bug Reports**: Use the bug report template
- **Feature Requests**: Use the feature request template
- **Documentation Updates**: Submit a PR with proposed changes

---

**Last Updated**: 2025-09-11  
**Next Review**: End of Sprint 1 (2025-10-03)