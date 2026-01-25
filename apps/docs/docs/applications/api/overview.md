---
sidebar_position: 1
---

# API Overview

Complete guide to the NestJS backend API.

## 🏗️ Architecture

The API follows **Clean Architecture** principles with clear separation of concerns:

```
apps/api/src/
├── modules/          # Feature modules
│   ├── auth/
│   ├── users/
│   ├── tracks/
│   ├── albums/
│   ├── artists/
│   ├── playlists/
│   └── files/
├── common/           # Shared code
│   ├── decorators/
│   ├── guards/
│   ├── filters/
│   └── pipes/
└── infra/            # Infrastructure
    ├── database/
    ├── config/
    └── storage/
```

## 🚀 Quick Start

```bash
cd apps/api

# Install dependencies
pnpm install

# Start database
docker compose up -d postgres

# Run migrations
pnpm db:migration:start

# Seed database
pnpm db:seed

# Start development server
pnpm start:dev
```

API will be available at `http://localhost:3000`

## 📚 API Documentation

### Swagger UI

Interactive API documentation available at:
- Development: http://localhost:3000/api
- Production: https://your-domain.com/api

### Compodoc

Technical documentation generated from code:

```bash
pnpm doc:gen
```

Opens at http://localhost:8080

## 🔐 Authentication

### Registration

**POST** `/auth/register`

```typescript
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "displayName": "John Doe"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

### Login

**POST** `/auth/login`

```typescript
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Token Refresh

**POST** `/auth/refresh`

```typescript
// Headers
Authorization: Bearer <refreshToken>

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Protected Routes

All routes except `/auth/*` require authentication:

```typescript
// Headers
Authorization: Bearer <accessToken>
```

## 🎵 Tracks API

### Upload Track

**POST** `/tracks`

```typescript
// multipart/form-data
{
  "title": "Song Title",
  "artistId": "uuid",
  "albumId": "uuid",  // optional
  "file": <audio file>
}

// Response
{
  "id": "uuid",
  "title": "Song Title",
  "artistId": "uuid",
  "albumId": "uuid",
  "duration": 245,
  "fileUrl": "/storage/tracks/uuid.opus",
  "createdAt": "2026-01-25T10:00:00Z"
}
```

### Get Tracks

**GET** `/tracks`

Query parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search query
- `artistId` - Filter by artist
- `albumId` - Filter by album

```typescript
// Response
{
  "data": [
    {
      "id": "uuid",
      "title": "Song Title",
      "artist": {
        "id": "uuid",
        "name": "Artist Name"
      },
      "album": {
        "id": "uuid",
        "title": "Album Title"
      },
      "duration": 245
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Stream Track

**GET** `/tracks/:id/stream`

Supports range requests (HTTP 206) for seeking.

```bash
curl -H "Range: bytes=0-" http://localhost:3000/tracks/uuid/stream
```

### Update Track

**PATCH** `/tracks/:id`

```typescript
// Request
{
  "title": "Updated Title",
  "artistId": "new-uuid"
}

// Response
{
  "id": "uuid",
  "title": "Updated Title",
  // ...updated fields
}
```

### Delete Track

**DELETE** `/tracks/:id`

```typescript
// Response
{
  "success": true
}
```

## 👤 Users API

### Get Current User

**GET** `/users/me`

```typescript
{
  "id": "uuid",
  "email": "user@example.com",
  "displayName": "John Doe",
  "avatarUrl": "/storage/avatars/uuid.jpg",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

### Update Profile

**PATCH** `/users/me`

```typescript
// Request
{
  "displayName": "New Name"
}

// Response
{
  "id": "uuid",
  "displayName": "New Name",
  // ...
}
```

### Upload Avatar

**POST** `/users/me/avatar`

```typescript
// multipart/form-data
{
  "file": <image file>
}

// Response
{
  "avatarUrl": "/storage/avatars/uuid.jpg"
}
```

## 📝 Playlists API

### Create Playlist

**POST** `/playlists`

```typescript
// Request
{
  "name": "My Playlist",
  "description": "Favorite songs",
  "isPublic": true
}

// Response
{
  "id": "uuid",
  "name": "My Playlist",
  "description": "Favorite songs",
  "isPublic": true,
  "userId": "uuid",
  "trackCount": 0
}
```

### Add Track to Playlist

**POST** `/playlists/:id/tracks`

```typescript
// Request
{
  "trackId": "uuid",
  "position": 0  // optional
}

// Response
{
  "success": true,
  "trackCount": 1
}
```

### Get Playlist

**GET** `/playlists/:id`

```typescript
{
  "id": "uuid",
  "name": "My Playlist",
  "tracks": [
    {
      "id": "uuid",
      "title": "Song Title",
      "artist": { "name": "Artist" },
      "position": 0
    }
  ],
  "trackCount": 10
}
```

## 🎨 Albums & Artists

### Create Artist

**POST** `/artists`

```typescript
{
  "name": "Artist Name",
  "bio": "Artist biography",
  "imageUrl": "https://..."
}
```

### Create Album

**POST** `/albums`

```typescript
{
  "title": "Album Title",
  "artistId": "uuid",
  "releaseDate": "2026-01-01",
  "coverUrl": "https://..."
}
```

## 🔌 WebSocket Events

### Connection

```typescript
import { io } from 'socket.io-client'

const socket = io('http://localhost:3000', {
  auth: {
    token: '<accessToken>'
  }
})
```

### Events

#### track:play

Notify other devices about playback:

```typescript
socket.emit('track:play', {
  trackId: 'uuid',
  position: 0
})
```

#### track:pause

```typescript
socket.emit('track:pause', {
  trackId: 'uuid',
  position: 123
})
```

#### track:updated

Receive real-time updates:

```typescript
socket.on('track:updated', (data) => {
  console.log('Track playing:', data.trackId)
  console.log('At position:', data.position)
})
```

## 📂 File Upload

### Storage Structure

```
storage/
├── uploads/
│   ├── tracks/
│   │   ├── original/
│   │   └── converted/
│   ├── avatars/
│   └── covers/
```

### Size Limits

- **Tracks**: 100MB
- **Images**: 10MB
- **Avatars**: 5MB

### Accepted Formats

#### Audio
- MP3
- WAV
- FLAC
- M4A
- OGG

#### Images
- JPEG
- PNG
- WebP

### Automatic Conversion

Uploaded tracks are automatically converted to OGG Opus:

```typescript
// Original file saved
storage/uploads/tracks/original/uuid.mp3

// Converted version
storage/uploads/tracks/converted/uuid.opus
```

## 🗄️ Database

### Prisma Schema

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  displayName  String
  avatarUrl    String?
  tracks       Track[]
  playlists    Playlist[]
  sessions     Session[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Track {
  id        String   @id @default(uuid())
  title     String
  artistId  String
  albumId   String?
  duration  Int
  fileUrl   String
  userId    String
  artist    Artist   @relation(fields: [artistId])
  album     Album?   @relation(fields: [albumId])
  user      User     @relation(fields: [userId])
  createdAt DateTime @default(now())
}

model Playlist {
  id          String   @id @default(uuid())
  name        String
  description String?
  isPublic    Boolean  @default(false)
  userId      String
  user        User     @relation(fields: [userId])
  tracks      PlaylistTrack[]
  createdAt   DateTime @default(now())
}
```

### Migrations

```bash
# Create new migration
pnpm db:migration:start

# Reset database
pnpm db:migration:reset

# Generate Prisma Client
pnpm db:gen

# Open Prisma Studio
pnpm db:ui
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# JWT
JWT_SECRET="secret"
JWT_REFRESH_SECRET="refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Storage
UPLOAD_DIR="./storage/uploads"
MAX_FILE_SIZE=104857600

# CORS
CORS_ORIGIN="http://localhost:3001"

# Redis (optional)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

## 🧪 Testing

### Unit Tests

```bash
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

### E2E Tests

```bash
pnpm test:e2e
```

### Test Structure

```
test/
├── app.e2e-spec.ts
├── auth.e2e-spec.ts
├── tracks.e2e-spec.ts
└── playlists.e2e-spec.ts
```

## 🚀 Deployment

### Build

```bash
pnpm build
```

### Production Start

```bash
NODE_ENV=production pnpm start:prod
```

### Docker

```bash
docker compose up -d api
```

## 📊 Monitoring

### Health Check

**GET** `/health`

```typescript
{
  "status": "ok",
  "database": "connected",
  "uptime": 12345
}
```

### Logs

Structured logging with timestamps:

```bash
# View logs
docker compose logs -f api

# Filter by level
docker compose logs api | grep ERROR
```

---

**Next:** [Web Application](/web) - Frontend development guide