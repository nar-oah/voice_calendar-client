import type { components } from '$lib/api/schema';

export type ScheduleEvent = components['schemas']['Event'];
export type ScheduleTime = components['schemas']['Time'];

export const getEmptyEvent = (): ScheduleEvent => {
	const getCurrentTime = (): ScheduleTime => {
		const now = new Date(Date.now() + 10 * 60 * 1000);
		return {
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate(),
			hour: now.getHours(),
			minute: now.getMinutes(),
			second: now.getSeconds()
		};
	};
	const now = getCurrentTime();
	return {
		action: 'create',
		id: 0,
		title: '喝水',
		start: now,
		end: { ...now, minute: now.minute + 5 },
		location: null,
		description: null
	};
};
