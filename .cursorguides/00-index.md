# Bump Project Guides

This directory contains guides, templates, and troubleshooting information for the Bump application. Use these resources to understand the project structure, implementation details, and best practices.

## Directory Structure

```
.cursorguides/
│
├── 00-index.md                # This file
│
├── implementations/           # Milestone implementation guides
│   ├── 01-initialize-project.md    # Project setup
│   ├── 02-supabase-integration.md  # Supabase backend setup
│   ├── 03-home-checkin.md          # Home page and check-in functionality
│   ├── 04-gathering-places.md      # Places functionality
│   ├── 05-friends-intent.md        # Friends and intent functionality
│   ├── 06-meetups.md               # Meetups functionality
│   ├── 07-settings.md              # Settings functionality
│   ├── 08-notifications.md         # Notifications functionality
│   └── 09-pwa-implementation.md    # PWA setup and optimization
│
├── concepts/                  # Conceptual guides
│   ├── authentication-flow.md      # Authentication concepts
│   ├── realtime-patterns.md        # Realtime data patterns
│   └── testing-strategy.md         # Overall testing approach
│
├── templates/                 # Reusable templates
│   ├── component-template.md       # React component patterns
│   ├── hook-template.md            # React hook patterns
│   ├── utility-functions-template.md # Utility function patterns
│   ├── test-template.md            # Test patterns
│   ├── supabase-integration-template.md # Supabase integration patterns
│   └── project-structure-template.md # Project structure patterns
│
└── troubleshooting/           # Common issues and solutions
    ├── supabase-testing.md         # Supabase testing challenges
    ├── authentication-issues.md    # Auth troubleshooting
    └── performance-optimization.md # Performance troubleshooting
```

## Milestone Implementation Guides

| # | Guide | Status | Description |
|---|-------|--------|-------------|
| 1 | [Initialize Project](./implementations/01-initialize-project.md) | ✅ Complete | Project setup, routing, styling, testing |
| 2 | [Supabase Integration](./implementations/02-supabase-integration.md) | ⏳ In Progress | Backend setup, authentication, database schema |
| 3 | [Home & Check-In](./implementations/03-home-checkin.md) | 🔜 Planned | Home page with status list and check-in form |
| 4 | [Gathering Places](./implementations/04-gathering-places.md) | 🔜 Planned | Places list/map with add/edit functionality |
| 5 | [Friends & Intent](./implementations/05-friends-intent.md) | 🔜 Planned | Friends list with intent toggles |
| 6 | [Meetups](./implementations/06-meetups.md) | 🔜 Planned | Meetup logging and history |
| 7 | [Settings](./implementations/07-settings.md) | 🔜 Planned | User preferences and settings |
| 8 | [Notifications](./implementations/08-notifications.md) | 🔜 Planned | Notification system |
| 9 | [PWA & Deploy](./implementations/09-pwa-implementation.md) | 🔜 Planned | PWA setup, offline support, and deployment |

## Templates

| Template | Description |
|----------|-------------|
| [Component Template](./templates/component-template.md) | Patterns for React components |
| [Hook Template](./templates/hook-template.md) | Patterns for React hooks |
| [Utility Functions Template](./templates/utility-functions-template.md) | Patterns for utility functions |
| [Test Template](./templates/test-template.md) | Patterns for tests |
| [Supabase Integration Template](./templates/supabase-integration-template.md) | Patterns for Supabase integration |
| [Project Structure Template](./templates/project-structure-template.md) | Patterns for project structure |

## Troubleshooting Guides

| Guide | Description |
|-------|-------------|
| [Supabase Testing](./troubleshooting/supabase-testing.md) | Solutions for common Supabase testing challenges |
| [Authentication Issues](./troubleshooting/authentication-issues.md) | Solutions for authentication problems |
| [Performance Optimization](./troubleshooting/performance-optimization.md) | Techniques for improving application performance |

## Concepts

| Guide | Description |
|-------|-------------|
| [Authentication Flow](./concepts/authentication-flow.md) | Overview of the authentication process |
| [Realtime Patterns](./concepts/realtime-patterns.md) | Patterns for realtime data handling |
| [Testing Strategy](./concepts/testing-strategy.md) | Overall approach to testing |

## How to Use These Guides

1. **Starting a new milestone**: Begin with the corresponding implementation guide in the `implementations/` directory.
2. **Understanding architecture**: Refer to concept guides in the `concepts/` directory.
3. **Troubleshooting issues**: Check the `troubleshooting/` directory for solutions to common problems.
4. **Creating new code**: Use templates from the `templates/` directory for consistent structure.

## Contributing to Guides

When updating these guides:

1. **Keep implementation details separate from concepts**: Implementation guides should focus on specific tasks, while concept guides should explain the underlying patterns.
2. **Document challenges and solutions**: Add troubleshooting entries when you encounter and solve issues.
3. **Extract reusable patterns**: When you identify a pattern that could be reused, add it to the templates directory.
4. **Update the index**: Keep this index file up to date with new guides and status changes.

## Next Steps

After reviewing this index, proceed to the guide that corresponds to your current task or milestone. 