import type { PrismaService } from '@infra/prisma/prisma.service'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { NotFoundException } from '@nestjs/common'
import type { SupportMessage, SupportTicket } from '@prisma/client'
import type { SupportInboxRow } from './entities'
import { SupportInboxService } from './support-inbox.service'

const NOW = new Date('2026-11-24T10:00:00Z')

const ticket: SupportTicket = {
  id: 't-1',
  createdAt: NOW,
  updatedAt: NOW,
  conversationId: 'c-1',
  reason: 'Payout is late',
  status: 'OPEN',
  resolvedAt: null,
}

const message = (id: string, role: SupportMessage['role'], text: string): SupportMessage => ({
  id,
  createdAt: NOW,
  conversationId: 'c-1',
  role,
  text,
  citations: null,
})

const row = (messages: SupportMessage[]): SupportInboxRow => ({
  id: 'c-1',
  createdAt: NOW,
  updatedAt: NOW,
  audience: 'ARTIST',
  channel: 'WEB',
  locale: 'uk',
  state: 'WAITING_OPERATOR',
  guestTokenHash: 'hash',
  userId: null,
  inputTokens: 10,
  outputTokens: 5,
  lastMessageAt: NOW,
  ticket,
  messages,
})

function makePrisma() {
  const prisma = {
    supportConversation: {
      findMany: jest.fn<(args?: unknown) => Promise<SupportInboxRow[]>>(),
      count: jest.fn<(args?: unknown) => Promise<number>>(),
      findUnique: jest.fn<(args?: unknown) => Promise<SupportInboxRow | null>>(),
      update: jest.fn<(args?: unknown) => Promise<unknown>>().mockResolvedValue({}),
    },
    supportTicket: {
      findUnique: jest.fn<(args?: unknown) => Promise<{ id: string } | null>>(),
      update: jest.fn<(args?: unknown) => Promise<unknown>>().mockResolvedValue({}),
    },
    supportMessage: {
      create: jest.fn<(args?: unknown) => Promise<unknown>>().mockResolvedValue({}),
    },
    $transaction: jest.fn(async (operations: Promise<unknown>[]) => await Promise.all(operations)),
  }
  return prisma
}

describe('SupportInboxService', () => {
  let prisma: ReturnType<typeof makePrisma>
  let service: SupportInboxService

  beforeEach(() => {
    prisma = makePrisma()
    service = new SupportInboxService(prisma as unknown as PrismaService)
  })

  describe('list', () => {
    it('lists only handed-off conversations, newest activity first, with a preview', async () => {
      prisma.supportConversation.findMany.mockResolvedValue([row([message('m-2', 'USER', 'Hi?')])])
      prisma.supportConversation.count.mockResolvedValue(1)

      const page = await service.list({})

      expect(prisma.supportConversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ticket: { isNot: null } },
          orderBy: [{ lastMessageAt: 'desc' }, { id: 'desc' }],
          skip: 0,
          take: 20,
        }),
      )
      expect(page).toMatchObject({ total: 1, page: 1, limit: 20 })
      expect(page.data[0]).toMatchObject({
        id: 'c-1',
        audience: 'artist',
        channel: 'web',
        state: 'waiting_operator',
        ticket: { reason: 'Payout is late', status: 'open' },
        lastMessage: { role: 'user', text: 'Hi?' },
      })
    })

    it('maps the filters onto the ticket status, channel and audience', async () => {
      prisma.supportConversation.findMany.mockResolvedValue([])
      prisma.supportConversation.count.mockResolvedValue(0)

      await service.list({ status: 'resolved', channel: 'telegram', audience: 'listener', page: 2 })

      expect(prisma.supportConversation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            ticket: { is: { status: 'RESOLVED' } },
            channel: 'TELEGRAM',
            audience: 'LISTENER',
          },
          skip: 20,
        }),
      )
    })
  })

  describe('view', () => {
    it('returns the whole history oldest first', async () => {
      prisma.supportConversation.findUnique.mockResolvedValue(
        row([message('m-1', 'USER', 'first'), message('m-2', 'ASSISTANT', 'second')]),
      )

      const view = await service.view('c-1')

      expect(view.messages.map((m) => m.text)).toEqual(['first', 'second'])
      expect(view.lastMessage?.text).toBe('second')
    })

    it('hides a conversation that was never handed off', async () => {
      prisma.supportConversation.findUnique.mockResolvedValue({ ...row([]), ticket: null })
      await expect(service.view('c-1')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('404s for a missing conversation', async () => {
      prisma.supportConversation.findUnique.mockResolvedValue(null)
      await expect(service.view('c-1')).rejects.toBeInstanceOf(NotFoundException)
    })
  })

  describe('reply', () => {
    it('adds an operator message, takes the conversation over and reopens the ticket in one transaction', async () => {
      prisma.supportTicket.findUnique.mockResolvedValue({ id: 't-1' })
      prisma.supportConversation.findUnique.mockResolvedValue(row([]))

      await service.reply('c-1', 'We are on it')

      expect(prisma.$transaction).toHaveBeenCalledTimes(1)
      expect(prisma.supportMessage.create).toHaveBeenCalledWith({
        data: { conversationId: 'c-1', role: 'OPERATOR', text: 'We are on it' },
      })
      expect(prisma.supportConversation.update).toHaveBeenCalledWith({
        where: { id: 'c-1' },
        data: { state: 'OPERATOR', lastMessageAt: expect.any(Date) },
      })
      expect(prisma.supportTicket.update).toHaveBeenCalledWith({
        where: { conversationId: 'c-1' },
        data: { status: 'OPEN', resolvedAt: null },
      })
    })

    it('refuses a conversation without a ticket and writes nothing', async () => {
      prisma.supportTicket.findUnique.mockResolvedValue(null)
      await expect(service.reply('c-1', 'Hello')).rejects.toBeInstanceOf(NotFoundException)
      expect(prisma.$transaction).not.toHaveBeenCalled()
    })
  })

  describe('resolve', () => {
    it('resolves the ticket and the conversation, so the assistant answers the next message', async () => {
      prisma.supportTicket.findUnique.mockResolvedValue({ id: 't-1' })
      prisma.supportConversation.findUnique.mockResolvedValue(row([]))

      await service.resolve('c-1')

      expect(prisma.supportConversation.update).toHaveBeenCalledWith({
        where: { id: 'c-1' },
        data: { state: 'RESOLVED' },
      })
      expect(prisma.supportTicket.update).toHaveBeenCalledWith({
        where: { conversationId: 'c-1' },
        data: { status: 'RESOLVED', resolvedAt: expect.any(Date) },
      })
    })

    it('refuses a conversation without a ticket', async () => {
      prisma.supportTicket.findUnique.mockResolvedValue(null)
      await expect(service.resolve('c-1')).rejects.toBeInstanceOf(NotFoundException)
    })
  })
})
