import { Component, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Title } from '@angular/platform-browser'
import { provideRouter, Router, TitleStrategy } from '@angular/router'
import { beforeEach, describe, expect, it } from 'vitest'
import { OperatorTitleStrategy } from './operator-title-strategy'

@Component({ template: '' })
class Blank {}

describe('OperatorTitleStrategy', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([
          { path: 'albums', title: 'Albums', component: Blank },
          { path: 'untitled', component: Blank },
          {
            path: '',
            children: [{ path: 'albums/:id', title: 'Album', component: Blank }],
          },
        ]),
        { provide: TitleStrategy, useClass: OperatorTitleStrategy },
      ],
    })
    TestBed.inject(Title).setTitle('Bitrate operators')
  })

  it('suffixes the route title with the panel name', async () => {
    await TestBed.inject(Router).navigateByUrl('/albums')

    expect(TestBed.inject(Title).getTitle()).toBe('Albums · Bitrate operators')
  })

  it('uses the deepest title under a componentless parent', async () => {
    await TestBed.inject(Router).navigateByUrl('/albums/42')

    expect(TestBed.inject(Title).getTitle()).toBe('Album · Bitrate operators')
  })

  it('leaves the title alone for a route without one', async () => {
    await TestBed.inject(Router).navigateByUrl('/untitled')

    expect(TestBed.inject(Title).getTitle()).toBe('Bitrate operators')
  })
})
