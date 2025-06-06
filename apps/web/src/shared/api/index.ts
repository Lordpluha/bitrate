import createFetchClient from "openapi-fetch";
import createClient from "openapi-react-query";
import type { paths } from "@spotify/contracts";

/**
 * Fetch client for the API.
 */
export const fetchClient = createFetchClient<paths>({
  baseUrl: "http://localhost/api",
});

/**
 * React Query client for the API.
 */
export const queryClient = createClient(fetchClient);