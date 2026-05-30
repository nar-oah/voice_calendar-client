<script lang="ts">
	import { ScheduleXCalendar } from '@schedule-x/svelte';
	import { createCalendar, createViewDay } from '@schedule-x/calendar';
	import type { CalendarApp, CalendarEventExternal } from '@schedule-x/calendar';
	import '@schedule-x/theme-default/dist/index.css';
	import 'temporal-polyfill/global';
	import { onMount } from 'svelte';
	import '@schedule-x/theme-shadcn/dist/index.css';
	import { createCurrentTimePlugin } from '@schedule-x/current-time';
	import { createEventsServicePlugin } from '@schedule-x/events-service';
	import { createEventModalPlugin } from '@schedule-x/event-modal';
	import WeekGridDate from '$lib/calendar/WeekGridDate.svelte';

	let calendarApp = $state<CalendarApp>();
	const eventsService = createEventsServicePlugin();
	const eventModal = createEventModalPlugin();
	export function addEvent(event: CalendarEventExternal) {
		eventsService.add(event);
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
			plugins: [createCurrentTimePlugin(), eventsService, eventModal]
		});
	});
</script>

<main>
	{#if calendarApp}
		<ScheduleXCalendar {calendarApp} weekGridDate={WeekGridDate} />
	{/if}
</main>

<style>
	:global(.sx__calendar) {
		border: none;
		border-radius: 0;
		box-shadow: none;
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
