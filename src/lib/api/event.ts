import { api } from './client';

export async function getEvent(text: string) {
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
