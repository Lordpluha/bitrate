'use client'

import { useQuery } from '@shared/api'

interface User {
  id: string
  username: string
  avatar?: string
  backgroundImage?: string
  bio?: string
  createdAt?: string
}

export const useUsers = () => {
  const { data, isPending, error } = useQuery(
    'get',
    '/api/v1/users' as any, // пока не могу убрать
    {
      params: {
        query: {
          page: 1,
          limit: 100,
          username: '',
        },
      },
    },
  )

  const users = Array.isArray(data) ? (data as User[]) : []

  return {
    users,
    isPending,
    error,
    getUserName: (userId: string): string =>
      users.find((user) => user.id === userId)?.username || 'Unknown',
  }
}
