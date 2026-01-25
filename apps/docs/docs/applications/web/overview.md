---
sidebar_position: 1
---

# Web Application

Next.js web application for music streaming.

## 🚀 Quick Start

```bash
cd apps/web

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Application will be available at `http://localhost:3001`

## 🏗️ Architecture

The web app follows **Feature-Sliced Design (FSD)** architecture:

```
apps/web/src/
├── app/              # App initialization & routing
│   ├── layout.tsx
│   ├── page.tsx
│   └── (routes)/
├── pages/            # Next.js pages (App Router)
├── widgets/          # Complex UI blocks
│   ├── Header/
│   ├── Player/
│   └── Sidebar/
├── features/         # User interactions
│   ├── auth/
│   ├── player/
│   └── playlists/
├── entities/         # Business entities
│   ├── track/
│   ├── user/
│   └── playlist/
├── shared/           # Shared utilities
│   ├── ui/          # UI components
│   ├── lib/         # Helper functions
│   ├── api/         # API client
│   └── hooks/       # Custom hooks
└── styles/          # Global styles
```

## 🎨 Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **@spotify/ui-react** - Shared components
- **SWR** - Data fetching
- **Zustand** - State management

## 📁 Key Features

### Authentication

Login and registration pages with JWT tokens:

```tsx
// app/(auth)/login/page.tsx
import { LoginForm } from '@/features/auth/LoginForm'

export default function LoginPage() {
  return <LoginForm />
}
```

### Music Player

Global music player with playback controls:

```tsx
// widgets/Player/Player.tsx
import { usePlayer } from '@/entities/player'

export function Player() {
  const { currentTrack, play, pause, isPlaying } = usePlayer()

  return (
    <div className="player">
      <TrackInfo track={currentTrack} />
      <PlaybackControls
        onPlay={play}
        onPause={pause}
        isPlaying={isPlaying}
      />
    </div>
  )
}
```

### Real-time Sync

WebSocket connection for cross-device synchronization:

```typescript
// shared/lib/socket.ts
import { io } from 'socket.io-client'

export const socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
  auth: {
    token: getAccessToken()
  }
})

socket.on('track:updated', (data) => {
  // Update player state
})
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3000

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# Optional: Analytics
NEXT_PUBLIC_GA_ID=
```

### API Client

```typescript
// shared/api/client.ts
import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## 🎯 Pages & Routes

### App Router Structure

```
app/
├── (auth)/
│   ├── login/
│   └── register/
├── (dashboard)/
│   ├── page.tsx          # Home
│   ├── library/
│   ├── search/
│   └── playlists/
│       └── [id]/
└── api/                  # API routes
    └── auth/
```

### Dynamic Routes

```tsx
// app/(dashboard)/playlists/[id]/page.tsx
import { getPlaylist } from '@/entities/playlist'

export default async function PlaylistPage({
  params
}: {
  params: { id: string }
}) {
  const playlist = await getPlaylist(params.id)

  return <PlaylistView playlist={playlist} />
}
```

## 🧪 Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch

# E2E tests
pnpm test:e2e
```

## 🚀 Build & Deploy

### Development

```bash
pnpm dev
```

### Production Build

```bash
pnpm build
pnpm start
```

### Docker

```bash
docker compose up -d web
```

## 📊 Performance

- **Lighthouse Score**: 95+
- **Bundle Size**: < 200KB (gzipped)
- **First Load**: < 2s
- **Time to Interactive**: < 3s

### Optimizations

- Code splitting by route
- Image optimization with Next.js Image
- Dynamic imports for heavy components
- SWR caching for API calls

---

**Related:**
- [Setup Guide](/getting-started/setup)
- [API Documentation](/applications/api/overview)
- [UI Components](/packages/ui-react)