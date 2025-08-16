# Streaming Audio with Personal Track Control

## Описание

Эта система обеспечивает персонализированный контроль воспроизведения аудио треков, где каждый пользователь может управлять только своими треками и получать уведомления только о своих действиях.

## Основные возможности

### 1. WebSocket Gateway (AudioGateway)
- **Персональные комнаты**: Каждый пользователь подключается к своей личной комнате `user_{userId}`
- **Аутентификация**: JWT токен проверяется при подключении
- **Сессии воспроизведения**: Отслеживание текущего трека и времени воспроизведения для каждого пользователя
- **Изолированные события**: События отправляются только в личную комнату пользователя

### 2. REST API Endpoints

#### Стриминг треков
```
GET /tracks/stream/:id
```
- Поддержка Range requests для прогрессивной загрузки
- Возвращает аудио файл с правильными HTTP заголовками

#### Управление воспроизведением
```
POST /tracks/play/:id
POST /tracks/pause/:id
POST /tracks/update-state/:id
GET /tracks/current-state
```

### 3. WebSocket События

#### Клиент → Сервер
- `playTrack`: Начать воспроизведение трека
- `pauseTrack`: Поставить трек на паузу
- `updateStreaming`: Обновить состояние воспроизведения
- `getCurrentState`: Получить текущее состояние

#### Сервер → Клиент
- `trackPlaying`: Трек начал воспроизводиться
- `trackPaused`: Трек поставлен на паузу
- `trackUpdated`: Состояние трека обновлено
- `trackState`: Текущее состояние трека

## Пример использования на клиенте

### JavaScript/TypeScript клиент

```typescript
import { io, Socket } from 'socket.io-client'

class AudioPlayer {
  private socket: Socket
  private currentTrack: string | null = null
  private audioElement: HTMLAudioElement

  constructor(token: string) {
    this.audioElement = new Audio()
    this.socket = io('ws://localhost:3000', {
      auth: { token }
    })

    this.setupEventListeners()
  }

  private setupEventListeners() {
    // Получение событий от сервера
    this.socket.on('trackPlaying', (data) => {
      console.log('Track started playing:', data)
      this.currentTrack = data.trackId
      if (data.track) {
        this.audioElement.src = `/api/tracks/stream/${data.trackId}`
        this.audioElement.currentTime = data.currentTime
        this.audioElement.play()
      }
    })

    this.socket.on('trackPaused', (data) => {
      console.log('Track paused:', data)
      this.audioElement.pause()
    })

    this.socket.on('trackUpdated', (data) => {
      console.log('Track state updated:', data)
      this.audioElement.currentTime = data.currentTime
      if (data.isPlaying) {
        this.audioElement.play()
      } else {
        this.audioElement.pause()
      }
    })

    this.socket.on('trackState', (data) => {
      console.log('Current track state:', data)
      if (data.isPlaying && data.trackId) {
        this.currentTrack = data.trackId
        this.audioElement.src = `/api/tracks/stream/${data.trackId}`
        this.audioElement.currentTime = data.currentTime || 0
        this.audioElement.play()
      }
    })

    // Отправка обновлений времени на сервер
    this.audioElement.addEventListener('timeupdate', () => {
      if (this.currentTrack) {
        this.socket.emit('updateStreaming', {
          trackId: this.currentTrack,
          userId: 'current-user-id', // Получить из контекста пользователя
          currentTime: this.audioElement.currentTime,
          isPlaying: !this.audioElement.paused
        })
      }
    })
  }

  playTrack(trackId: string, userId: string) {
    this.socket.emit('playTrack', {
      trackId,
      userId,
      currentTime: 0
    })
  }

  pauseTrack() {
    if (this.currentTrack) {
      this.socket.emit('pauseTrack', {
        trackId: this.currentTrack,
        userId: 'current-user-id',
        currentTime: this.audioElement.currentTime
      })
    }
  }

  getCurrentState() {
    this.socket.emit('getCurrentState')
  }
}

// Использование
const player = new AudioPlayer('your-jwt-token')
player.playTrack('track-uuid', 'user-uuid')
```

### React Hook пример

```typescript
import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export const useAudioPlayer = (token: string) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const socketRef = useRef<Socket>()
  const audioRef = useRef<HTMLAudioElement>()

  useEffect(() => {
    socketRef.current = io('ws://localhost:3000', {
      auth: { token }
    })

    audioRef.current = new Audio()

    const socket = socketRef.current
    const audio = audioRef.current

    socket.on('trackPlaying', (data) => {
      setCurrentTrack(data.trackId)
      setIsPlaying(true)
      if (data.track) {
        audio.src = `/api/tracks/stream/${data.trackId}`
        audio.currentTime = data.currentTime
        audio.play()
      }
    })

    socket.on('trackPaused', (data) => {
      setIsPlaying(false)
      audio.pause()
    })

    socket.on('trackUpdated', (data) => {
      setCurrentTime(data.currentTime)
      setIsPlaying(data.isPlaying)
      audio.currentTime = data.currentTime
      if (data.isPlaying) {
        audio.play()
      } else {
        audio.pause()
      }
    })

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    return () => {
      socket.disconnect()
    }
  }, [token])

  const playTrack = (trackId: string, userId: string) => {
    socketRef.current?.emit('playTrack', {
      trackId,
      userId,
      currentTime: 0
    })
  }

  const pauseTrack = (userId: string) => {
    if (currentTrack) {
      socketRef.current?.emit('pauseTrack', {
        trackId: currentTrack,
        userId,
        currentTime: audioRef.current?.currentTime || 0
      })
    }
  }

  return {
    isPlaying,
    currentTrack,
    currentTime,
    playTrack,
    pauseTrack,
    audioElement: audioRef.current
  }
}
```

## Безопасность

1. **JWT аутентификация**: Все WebSocket подключения требуют валидный JWT токен
2. **Персональные комнаты**: Пользователи получают события только из своих комнат
3. **Валидация треков**: Проверка существования трека перед воспроизведением
4. **Изоляция пользователей**: Каждый пользователь контролирует только свои треки

## Масштабируемость

Система поддерживает:
- Множественные одновременные подключения пользователей
- Отслеживание состояния воспроизведения для каждого пользователя
- Эффективную передачу аудио через Range requests
- Реактивные обновления состояния через WebSocket

## Развертывание

1. Убедитесь, что JWT_SECRET настроен в переменных окружения
2. Аудио файлы должны быть доступны по путям, указанным в `track.audioUrl`
3. Настройте CORS для WebSocket соединений если необходимо
