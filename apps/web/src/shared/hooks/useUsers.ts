'use client'

import { useQuery } from '@shared/api'

export const useUsers = () => {
  const { data, isPending, error } = useQuery('get', '/api/v1/users', {
    params: {
      path: {
        page: 1,
        limit: 100,
        username: ''
      }
    }
  }) as any

  const users = Array.isArray(data) ? data : data?.data || []
  const usersMap = new Map<string, string>(users.map((user: any) => [user.id, user.username]))

  return {
    usersMap,
    isPending,
    error,
    getUserName: (userId: string): string => usersMap.get(userId) || 'Unknown'
  }
}
