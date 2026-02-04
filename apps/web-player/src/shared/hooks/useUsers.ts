'use client'

// import { useQuery } from '@shared/api'

export const useUsers = () => {
  // API requires specific username parameter and doesn't support fetching all users
  // Commented out to prevent validation errors
  // const { data, isPending, error } = useQuery('get', '/api/v1/users', {
  //   params: {
  //     query: {
  //       page: 1,
  //       limit: 100,
  //       username: ' ',
  //     },
  //   },
  // }, {
  //   enabled: false, // Disable automatic fetching
  // }) as any

  // const users = Array.isArray(data) ? data : data?.data || []
  const users: any[] = []
  const usersMap = new Map<string, string>(
    users.map((user: any) => [user.id, user.username]),
  )

  return {
    usersMap,
    isPending: false,
    error: null,
    getUserName: (userId: string): string => usersMap.get(userId) || 'Unknown',
  }
}
