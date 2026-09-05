---
sidebar_position: 1
---

# Contributing Guide

Thank you for your interest in contributing to Bitrate!

## 🎯 Ways to Contribute

- 🐛 **Report Bugs** - Submit detailed bug reports
- 💡 **Suggest Features** - Propose new features or improvements
- 📝 **Improve Documentation** - Fix typos, add examples
- 🔀 **Submit Code** - Fix bugs, implement features
- ⭐ **Spread the Word** - Star the repo, share with others

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/bitrate.git
cd bitrate
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/Lordpluha/bitrate.git
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format
<type>(<scope>): <subject>

# Examples
feat(api): add track upload endpoint
fix(web): resolve player sync issue
docs(readme): update installation steps
chore(deps): update dependencies
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes

### Scopes

- `api` - Backend API
- `web` - Web application
- `mobile` - Mobile application
- `desktop` - Desktop application
- `packages` - Shared packages
- `infra` - Infrastructure

## 🔄 Development Workflow

### 1. Keep Your Fork Updated

```bash
git fetch upstream
git checkout develop
git merge upstream/develop
```

### 2. Make Your Changes

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Run tests
pnpm test

# Run linter
pnpm lint

# Format code
pnpm format
```

### 3. Commit Your Changes

```bash
git add .
git commit -m "feat(api): add new feature"
```

### 4. Push to Your Fork

```bash
git push origin feature/new-feature
```

### 5. Create Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your branch
4. Fill in the PR template
5. Submit!

## ✅ Pull Request Checklist

Before submitting:

- [ ] Code follows project style
- [ ] Tests pass (`pnpm test`)
- [ ] Linter passes (`pnpm lint`)
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] PR description is clear
- [ ] Branch is up-to-date with `develop`

## 🧪 Testing

### Run Tests

```bash
# All tests
pnpm test

# Specific app
pnpm --filter @bitrate/api test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

### Writing Tests

```typescript
// Example: track.service.spec.ts
describe('TracksService', () => {
  it('should create a track', async () => {
    const dto = { title: 'Test Track', artistId: 'uuid' }
    const result = await service.create(dto)
    expect(result).toBeDefined()
    expect(result.title).toBe('Test Track')
  })
})
```

## 📋 Code Style

### TypeScript

```typescript
// ✅ Good
export interface CreateTrackDto {
  title: string
  artistId: string
  albumId?: string
}

export async function createTrack(dto: CreateTrackDto): Promise<Track> {
  const track = await prisma.track.create({ data: dto })
  return track
}

// ❌ Bad
export async function createTrack(dto: any) {
  return await prisma.track.create({ data: dto })
}
```

### React Components

```tsx
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  onClick,
  children
}) => {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

// ❌ Bad
export const Button = (props: any) => {
  return <button {...props} />
}
```

### File Naming

- Components: `PascalCase.tsx`
- Services: `kebab-case.service.ts`
- Utilities: `kebab-case.ts`
- Tests: `*.spec.ts` or `*.test.ts`

## 🐛 Bug Reports

Use the [bug report template](https://github.com/Lordpluha/bitrate/issues/new?template=bug_report.md):

**Required Information:**
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node version, etc.)
- Screenshots (if applicable)

## 💡 Feature Requests

Use the [feature request template](https://github.com/Lordpluha/bitrate/issues/new?template=feature_request.md):

**Required Information:**
- Problem description
- Proposed solution
- Alternatives considered
- Use cases

## 📖 Documentation

### Updating Docs

```bash
cd apps/docs

# Start dev server
pnpm start

# Make changes to markdown files
# ...

# Build to verify
pnpm build
```

### Documentation Style

- Use clear, concise language
- Include code examples
- Add screenshots when helpful
- Keep formatting consistent

## 🔒 Security

**Do not** open public issues for security vulnerabilities.

Instead, email: [security@example.com](mailto:security@example.com)

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the project's license.

## 🙏 Thank You!

Every contribution, no matter how small, is valued and appreciated!

---

**Questions?** Open a [discussion](https://github.com/Lordpluha/bitrate/discussions) or join our community.