import createClient from 'openapi-fetch';
import { bridgeFetch } from '$lib/bridge/http';
import type { paths } from './schema';

export const api = createClient<paths>({
	baseUrl: 'https://aws.naroah.top/calendar',
	fetch: bridgeFetch
});
