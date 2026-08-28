import { describe, expect, it, jest } from '@jest/globals'
import type { CallHandler, ExecutionContext } from '@nestjs/common'
import { lastValueFrom, of } from 'rxjs'
import type { PrismaService } from '../prisma/prisma.service'
import { AuditInterceptor } from './audit.interceptor'

class PlaylistsController {
  updatePlaylist() {
    return undefined
  }
}

const makeContext = (request: object) =>
  ({
    switchToHttp: () => ({ getRequest: () => request }),
    getClass: () => PlaylistsController,
    getHandler: () => PlaylistsController.prototype.updatePlaylist,
  }) as unknown as ExecutionContext

const next: CallHandler = { handle: () => of({ ok: true }) }

describe('AuditInterceptor', () => {
  it('records user actors using the User relation and controller model semantics', async () => {
    const create = jest.fn<(args: unknown) => Promise<unknown>>().mockResolvedValue({})
    const interceptor = new AuditInterceptor({ auditLog: { create } } as unknown as PrismaService)
    const targetId = '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea1'
    const requestId = '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea2'
    const request = {
      method: 'PATCH',
      route: { path: '/api/v1/playlists/:id' },
      path: `/api/v1/playlists/${targetId}`,
      params: { id: targetId },
      ip: '203.0.113.10',
      requestId,
      user: { id: '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea3' },
    }

    await lastValueFrom(interceptor.intercept(makeContext(request), next))

    expect(create).toHaveBeenCalledWith({
      data: {
        userId: request.user.id,
        action: 'playlists.updatePlaylist',
        entityType: 'playlists',
        entityId: targetId,
        ipAddress: '203.0.113.10',
        metadata: {
          actorType: 'user',
          actorId: request.user.id,
          requestId,
          method: 'PATCH',
          route: '/api/v1/playlists/:id',
        },
      },
    })
  })

  it('does not assign an artist ID to the User foreign key', async () => {
    const create = jest.fn<(args: unknown) => Promise<unknown>>().mockResolvedValue({})
    const interceptor = new AuditInterceptor({ auditLog: { create } } as unknown as PrismaService)
    const artistId = '018f47a2-7b5d-7cc3-8d25-8aa38e5f4ea4'
    const request = {
      method: 'POST',
      route: { path: '/api/v1/playlists' },
      params: {},
      ip: '203.0.113.11',
      artist: { id: artistId },
    }

    await lastValueFrom(interceptor.intercept(makeContext(request), next))

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: undefined,
          metadata: expect.objectContaining({ actorType: 'artist', actorId: artistId }),
        }),
      }),
    )
  })

  it('waits for audit persistence before completing a mutation response', async () => {
    let finishPersistence: (() => void) | undefined
    const create = jest.fn<(args: unknown) => Promise<unknown>>().mockImplementation(
      () =>
        new Promise((resolve) => {
          finishPersistence = () => resolve({})
        }),
    )
    const interceptor = new AuditInterceptor({ auditLog: { create } } as unknown as PrismaService)
    const request = {
      method: 'DELETE',
      route: { path: '/api/v1/playlists/:id' },
      params: {},
      ip: '203.0.113.12',
    }
    let completed = false

    const result = lastValueFrom(interceptor.intercept(makeContext(request), next)).then(() => {
      completed = true
    })
    await Promise.resolve()

    expect(completed).toBe(false)
    finishPersistence?.()
    await result
    expect(completed).toBe(true)
  })

  it('fails open after awaiting an audit storage error', async () => {
    const create = jest
      .fn<(args: unknown) => Promise<unknown>>()
      .mockRejectedValue(new Error('database unavailable'))
    const interceptor = new AuditInterceptor({ auditLog: { create } } as unknown as PrismaService)
    const logger = Reflect.get(interceptor, 'logger') as {
      error: (message: string, error?: unknown) => void
    }
    const logError = jest.spyOn(logger, 'error').mockImplementation(() => undefined)
    const request = {
      method: 'POST',
      route: { path: '/api/v1/playlists' },
      params: {},
      ip: '203.0.113.13',
    }

    await expect(lastValueFrom(interceptor.intercept(makeContext(request), next))).resolves.toEqual(
      {
        ok: true,
      },
    )
    expect(logError).toHaveBeenCalledWith('Failed to persist audit log', expect.any(Error))
  })

  it('does not audit read-only requests', async () => {
    const create = jest.fn<(args: unknown) => Promise<unknown>>()
    const interceptor = new AuditInterceptor({ auditLog: { create } } as unknown as PrismaService)

    await lastValueFrom(interceptor.intercept(makeContext({ method: 'GET' }), next))

    expect(create).not.toHaveBeenCalled()
  })
})
