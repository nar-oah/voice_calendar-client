import type { components } from '$lib/api/schema';

export type ScheduleEvent = components['schemas']['Event'];
export type ScheduleTime = components['schemas']['Time'];

const getCurrentTime = (): ScheduleTime => {
	const now = new Date();
	return {
		year: now.getFullYear(),
		month: now.getMonth() + 1,
		day: now.getDate(),
		hour: now.getHours(),
		minute: now.getMinutes(),
		second: now.getSeconds()
	};
};

export const getEmptyEvent = (): ScheduleEvent => {
	const now = getCurrentTime();
	return {
		action: 'create',
		title: '',
		start: now,
		end: { ...now },
		location: null,
		description: null
	};
};
