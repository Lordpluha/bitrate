---
name: 🚀 API Feature Request
about: Suggest a new feature for the NestJS API
title: "[API] "
labels: ["feature", "api"]
assignees: []
---

## 📋 Feature Description
<!-- Clear and concise description of the proposed feature -->


## 🎯 Problem & Motivation
<!-- What problem does this solve? Why is it needed? -->


## 💡 Proposed Solution

### API Endpoints
<!-- Describe the new or modified endpoints -->

#### `POST /api/v1/[resource]`
**Purpose**: Create a new resource
**Request**:
```json
{
  "field": "value"
}
```
**Response**:
```json
{
  "id": "uuid",
  "field": "value",
  "createdAt": "2026-01-07T00:00:00Z"
}
```

### Database Schema Changes
<!-- Prisma schema modifications needed -->
```prisma
model NewModel {
  id        String   @id @default(uuid())
  field     String
  createdAt DateTime @default(now())
}
```

### Business Logic
<!-- Describe the core logic -->
-
-

## 🔧 Technical Implementation

### Module Structure
- [ ] Create `src/[module]/[module].module.ts`
- [ ] Create `src/[module]/[module].controller.ts`
- [ ] Create `src/[module]/[module].service.ts`
- [ ] Create `src/[module]/dto/` folder
- [ ] Create `src/[module]/entities/` folder

### Dependencies
- [ ] Prisma schema update
- [ ] New npm packages:
- [ ] Third-party API integration:

### Authentication & Authorization
- [ ] Public endpoint
- [ ] Requires authentication (JWT)
- [ ] Requires specific role: [Admin | User]
- [ ] Custom guard needed

## ✅ Acceptance Criteria
- [ ] API endpoints implemented and documented (Swagger)
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests (e2e) passing
- [ ] Error handling implemented
- [ ] Input validation with class-validator
- [ ] Database migrations created
- [ ] API documentation updated (Swagger/contracts)

## 🧪 Testing Strategy
```typescript
// Example test cases
describe('NewFeature', () => {
  it('should create resource', async () => {
    // Test implementation
  });

  it('should handle validation errors', async () => {
    // Test implementation
  });
});
```

## 📖 Documentation
- [ ] Update `packages/contracts` OpenAPI spec
- [ ] Update API README
- [ ] Add JSDoc comments
- [ ] Update Prisma schema comments

## 🔗 References
<!-- Related issues, PRs, documentation, or examples -->