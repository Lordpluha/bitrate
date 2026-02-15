import { ServerApi } from '@shared/api/server'
import 'server-only'

class TrackApiServerClass extends ServerApi {
	getLiked = async () => this.get('/api/v1/tracks/liked')
}

export const TrackServerApi = new TrackApiServerClass()
