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
export async function getEvent(token: string, text: string): Promise<Event | undefined> {
	const { data, error } = await api.POST('/parser', {
		params: {
			query: {
				token,
				text
			}
		}
	});
	if (!error && data) {
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
export async function addEvents(token: string, event: Event): Promise<StoredEvent | undefined> {
	const { data, error } = await api.POST('/add', {
		params: {
			query: {
				token
			}
		},
		body: event
	});
	if (!error && data) {
		return data;
	}
}
export async function delEvents(token: string, id: number): Promise<void> {
	await api.POST('/del', {
		params: {
			query: {
				token,
				id
			}
		}
	});
}
export async function getIcs(token: string, pd: Temporal.PlainDate): Promise<void> {
	const date = pd.toString();
	const { data, error } = await api.POST('/export', {
		params: {
			query: {
				token,
				date
			}
		},
		parseAs: 'blob'
	});
	if (!error && data) {
		const url = URL.createObjectURL(data);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'voice_calendar.ics';
		a.click();
		URL.revokeObjectURL(url);
	}
}
