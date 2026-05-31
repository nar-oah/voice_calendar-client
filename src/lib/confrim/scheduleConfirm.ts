import type { components } from '$lib/api/schema';

export type ScheduleEvent = components['schemas']['Event'];
export type ScheduleTime = components['schemas']['Time'];
export type EditableEvent = Omit<ScheduleEvent, 'start' | 'end' | 'location' | 'description'> & {
	start: ScheduleTime;
	end: ScheduleTime;
	location: string;
	description: string;
};

type ScheduleAction = ScheduleEvent['action'];

export const actionText = {
	create: '新建',
	delete: '删除',
	read: '查看'
} satisfies Record<ScheduleAction, string>;

export const confirmText = {
	create: '确认创建',
	delete: '确认删除',
	read: '跳转日期'
} satisfies Record<ScheduleAction, string>;

export const actionBadgeClass = {
	create: 'bg-zinc-950 text-white',
	delete: 'bg-red-600 text-white',
	read: 'bg-amber-500 text-zinc-950'
} satisfies Record<ScheduleAction, string>;

export const confirmButtonClass = {
	create: 'b-zinc-950 bg-zinc-950 text-white hover:bg-zinc-800',
	delete: 'b-red-600 bg-red-600 text-white hover:bg-red-700',
	read: 'b-amber-500 bg-amber-500 text-zinc-950 hover:bg-amber-400'
} satisfies Record<ScheduleAction, string>;

export const editButtonClass =
	'rounded-lg b-2 b-solid b-zinc-950 bg-white px-4 py-2 text-sm font-medium whitespace-nowrap text-zinc-950 shadow-sm transition hover:bg-zinc-100';
export const fieldClass =
	'rounded-md b-solid b-3 b-black bg-white px-5 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400';
export const smallFieldClass =
	'rounded-md b-solid b-3 b-black bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400';

const pad = (value: number) => String(value).padStart(2, '0');
const copyTime = (time: ScheduleTime): ScheduleTime => ({ ...time });
const normalizeText = (value: string): string | null => {
	const text = value.trim();
	return text ? text : null;
};

export const formatTime = (time: ScheduleTime) =>
	`${time.year}-${pad(time.month)}-${pad(time.day)} ${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}`;

export const emptyEvent = (): EditableEvent => ({
	id: 0,
	action: 'create',
	title: '',
	start: { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
	end: { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
	location: '',
	description: ''
});

export const copyEvent = (event: ScheduleEvent): EditableEvent => ({
	id: event.id,
	action: event.action,
	title: event.title,
	start: copyTime(event.start),
	end: copyTime(event.end),
	location: event.location ?? '',
	description: event.description ?? ''
});

export const normalizeEvent = (draft: EditableEvent): ScheduleEvent => ({
	id: draft.id,
	action: draft.action,
	title: draft.title.trim(),
	start: copyTime(draft.start),
	end: copyTime(draft.end),
	location: normalizeText(draft.location),
	description: normalizeText(draft.description)
});
