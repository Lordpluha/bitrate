import { Location } from '@angular/common'
import { provideLocationMocks } from '@angular/common/testing'
import { provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, type Routes } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import type { Page, TakeDownInput } from '@domain/shared'
import { type ListUsersQuery, type User, type UserDetail, UserRepository } from '@domain/user'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UsersPage } from './users'

function user(overrides: Partial<User> = {}): User {
  return {
    id: '3f2504e0-4f89-41d3-9a0c-0305e82c3301',
    username: 'listener-1',
    email: 'listener@example.com',
    emailVerifiedAt: null,
    createdAt: new Date('2026-09-01T09:59:00.000Z'),
    deactivatedAt: null,
    ...overrides,
  }
}

const list = vi.fn<(query: ListUsersQuery) => Promise<Page<User>>>()

/** A stub of the port — only `list` is exercised by this page's specs. */
class StubUserRepository extends UserRepository {
  override list(query: ListUsersQuery): Promise<Page<User>> {
    return list(query)
  }

  override getById(_id: string): Promise<UserDetail> {
    throw new Error('not used')
  }

  override deactivate(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override restore(_input: TakeDownInput): Promise<void> {
    throw new Error('not used')
  }

  override revokeSessions(_input: TakeDownInput): Promise<number> {
    throw new Error('not used')
  }
}

const routes: Routes = [{ path: 'users', component: UsersPage }]

describe('UsersPage', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    list.mockReset()
    list.mockResolvedValue({ items: [user()], total: 1, page: 1, limit: 20 })

    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        provideLocationMocks(),
        { provide: UserRepository, useClass: StubUserRepository },
      ],
    })
    harness = await RouterTestingHarness.create()
  })

  it('links a listener row to its detail route', async () => {
    await harness.navigateByUrl('/users', UsersPage)
    await harness.fixture.whenStable()

    const link = harness.routeNativeElement?.querySelector<HTMLAnchorElement>(
      'tbody a[href="/users/3f2504e0-4f89-41d3-9a0c-0305e82c3301"]',
    )
    expect(link?.textContent?.trim()).toBe('listener-1')
  })

  it('patches the URL with a status filter and resets to page one', async () => {
    await harness.navigateByUrl('/users?page=3', UsersPage)
    await harness.fixture.whenStable()

    harness.routeNativeElement
      ?.querySelectorAll<HTMLButtonElement>('[aria-label="Filter by status"] button')[1]
      ?.click()
    await harness.fixture.whenStable()

    const location = TestBed.inject(Location)
    expect(location.path()).toBe('/users?status=deactivated')
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 1,
        filter: expect.objectContaining({ status: 'deactivated' }),
      }),
    )
  })
})
