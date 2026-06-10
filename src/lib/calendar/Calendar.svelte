<script lang="ts">
	import { ScheduleXCalendar } from '@schedule-x/svelte';
	import { createCalendar, createViewDay } from '@schedule-x/calendar';
	import type { CalendarApp, CalendarEventExternal } from '@schedule-x/calendar';
	import '@schedule-x/theme-default/dist/index.css';
	import 'temporal-polyfill/global';
	import { onMount, setContext } from 'svelte';
	import '@schedule-x/theme-shadcn/dist/index.css';
	import { createCurrentTimePlugin } from '@schedule-x/current-time';
	import { createEventsServicePlugin } from '@schedule-x/events-service';
	import { createEventModalPlugin } from '@schedule-x/event-modal';
	import { createCalendarControlsPlugin } from '@schedule-x/calendar-controls';
	import CalendarEventModal from '$lib/calendar/CalendarEventModal.svelte';
	import WeekGridDate from '$lib/calendar/WeekGridDate.svelte';
	import {
		calendarEventModalContextKey,
		type CalendarEventModalContext
	} from '$lib/calendar/calendarEventModalContext';

	let calendarApp = $state<CalendarApp>();
	let {
		onDelete
	}: {
		onDelete?: (id: number) => void | Promise<void>;
	} = $props();
	const eventsService = createEventsServicePlugin();
	const calendarControls = createCalendarControlsPlugin();
	const eventModal = createEventModalPlugin();
	setContext<CalendarEventModalContext>(calendarEventModalContextKey, {
		close: () => eventModal.close(),
		deleteEvent: (id) => {
			eventModal.close();
			void onDelete?.(id);
		}
	});
	export function addEvent(event: CalendarEventExternal): void {
		eventsService.add(event);
	}
	export function delEvent(id: number): void {
		eventsService.remove(id);
	}
	export function readEvent(time: Temporal.PlainDate): void {
		calendarControls.setDate(time);
	}
	export function get_date(): Temporal.PlainDate {
		return calendarControls.getDate();
	}
	onMount(() => {
		calendarApp = createCalendar({
			theme: 'shadcn',
			locale: 'zh-CN',
			timezone: 'Asia/Shanghai',
			views: [createViewDay()],
			weekOptions: {
				gridHeight: window.innerHeight - 16 - 80,
				gridStep: 120,
				timeAxisFormatOptions: {
					hour: '2-digit',
					minute: '2-digit'
				}
			},
			plugins: [createCurrentTimePlugin(), eventsService, eventModal, calendarControls]
		});
	});
</script>

<main>
	{#if calendarApp}
		<ScheduleXCalendar {calendarApp} eventModal={CalendarEventModal} weekGridDate={WeekGridDate} />
	{/if}
</main>

<style>
	:global(.sx__calendar) {
		border: none;
		border-radius: 0;
		box-shadow: none;
	}
	:global(.sx__event-modal) {
		background: transparent !important;
		box-shadow: none !important;
	}
	:global(.sx__week-header) {
		display: none;
	}
	:global(.sx__today-button),
	:global(.sx__date-input) {
		border: none !important;
		box-shadow: none !important;
		outline: none !important;
	}
</style>
