import { createQueryClient } from '@shared/api/client'

/**
 * The renderer's one query client. A module singleton rather than component state, because
 * the router's session guard reads the same cache (`auth.me`) the reused views fill.
 */
export const queryClient = createQueryClient()
