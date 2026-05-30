import { api } from './client';
import type { components } from '$lib/api/schema';

type Event = components['schemas']['Event'];
type StoredEvent = components['schemas']['StoredEvent'];
export async function getToken(): Promise<string | undefined> {
	const { data, error } = await api.GET('/token', {});
	if (!error) {
		return data;
	}
}
export async function getEvent(text: string): Promise<Event | undefined> {
	const { data, error } = await api.POST('/event', {
		params: {
			query: {
				text
			}
		}
	});
	if (!error) {
		return data;
	}
}
export async function getEvents(token: string): Promise<StoredEvent[] | undefined> {
	const { data, error } = await api.POST('/events', {
		params: {
			query: {
				token
			}
		}
	});
	if (!error) {
		return data;
	}
}
