---
name: 🌐 Web Feature Request
about: Suggest a new feature for the Next.js web app
title: "[WEB] "
labels: ["feature", "web"]
assignees: []
---

## 📝 Feature Description
<!-- Clear description of the proposed feature -->


## 🎯 Problem & Motivation
<!-- What problem does this solve? User story: "As a [user], I want [feature] so that [benefit]" -->


## 💡 Proposed Solution

### Pages/Routes
- [ ] New page: `/[route]`
- [ ] Modify existing: `/[route]`

### Components
```typescript
// Example component structure
interface NewFeatureProps {
  // Props
}

function NewFeature({ }: NewFeatureProps) {
  // Implementation
}
```

### UI/UX Design
<!-- Describe the visual design, attach mockups/wireframes if available -->

**Desktop**:
**Tablet**:
**Mobile**:

## 🔧 Technical Implementation

### Frontend
- [ ] Create components in `src/components/`
- [ ] Add pages in `src/app/`
- [ ] Update routing
- [ ] State management (React Context | Zustand)
- [ ] Form validation (react-hook-form + zod)

### API Integration
- [ ] API endpoints needed: `/api/v1/...`
- [ ] Data fetching: Server Components | Client-side
- [ ] Caching strategy

### Styling
- [ ] Tailwind CSS classes
- [ ] Responsive breakpoints
- [ ] Dark/Light theme support
- [ ] Animations (Framer Motion)

### Dependencies
<!-- New packages needed -->
```bash
pnpm add [package-name]
```

## ✅ Acceptance Criteria
- [ ] Feature works on all devices (desktop, tablet, mobile)
- [ ] Responsive design implemented
- [ ] Dark/light theme support
- [ ] Loading & error states handled
- [ ] Forms validated
- [ ] Accessibility (keyboard nav, screen readers)
- [ ] Tests written (unit + e2e)

## 🧪 Testing
```typescript
// Example test
describe('NewFeature', () => {
  it('should render correctly', () => {
    // Test
  });
});
```

## ♿ Accessibility
- [ ] Keyboard navigation
- [ ] ARIA labels
- [ ] Color contrast (WCAG AA)
- [ ] Focus management

## 📚 Documentation
- [ ] Update README
- [ ] Storybook story (if UI component)
- [ ] JSDoc comments

## 🔗 References
<!-- Mockups, similar features, related issues -->