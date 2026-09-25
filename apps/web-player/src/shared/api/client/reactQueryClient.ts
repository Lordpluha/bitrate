'use client'

import createClient from 'openapi-react-query'

import { clientFetchClient } from './fetchClient'

const rqClient = createClient(clientFetchClient)
const { useQuery, useMutation, queryOptions } = rqClient

export { queryOptions, useMutation, useQuery }
