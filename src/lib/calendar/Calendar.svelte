<script lang="ts">
	import { ScheduleXCalendar } from '@schedule-x/svelte';
	import { CalendarApp, createCalendar, createViewDay } from '@schedule-x/calendar';
	import '@schedule-x/theme-default/dist/index.css';
	import 'temporal-polyfill/global';
	import { onMount } from 'svelte';
	import { createCurrentTimePlugin } from '@schedule-x/current-time';
	import Header from '$lib/calendar/Header.svelte';
	import WeekGridDate from '$lib/calendar/WeekGridDate.svelte';

	let calendarApp = $state<CalendarApp>();
	onMount(() => {
		calendarApp = createCalendar({
			locale: 'zh-CN',
			timezone: 'Asia/Shanghai',
			views: [createViewDay()],
			weekOptions: {
				gridHeight: window.innerHeight - 16,
				gridStep: 120,
				timeAxisFormatOptions: {
					hour: '2-digit',
					minute: '2-digit'
				}
			},
			events: [
				{
					id: '1',
					title: 'Event 1',
					start: Temporal.PlainDate.from('2024-07-06'),
					end: Temporal.PlainDate.from('2024-07-06')
				},
				{
					id: '2',
					title: 'Event 2',
					start: Temporal.ZonedDateTime.from('2024-07-06T02:00:00+09:00[Asia/Tokyo]'),
					end: Temporal.ZonedDateTime.from('2024-07-06T04:00:00+09:00[Asia/Tokyo]')
				},
				{
					id: '3',
					title: 'Event 3',
					start: Temporal.ZonedDateTime.from('2026-05-29T13:30:00+08:00[Asia/Shanghai]'),
					end: Temporal.ZonedDateTime.from('2026-05-29T14:30:00+08:00[Asia/Shanghai]')
				}
			],
			plugins: [createCurrentTimePlugin()]
		});
	});
</script>

<main>
	{#if calendarApp}
		<ScheduleXCalendar {calendarApp} headerContent={Header} weekGridDate={WeekGridDate} />
	{/if}
</main>

<style>
	:global(.sx__calendar) {
		border: none;
		border-radius: 0;
		box-shadow: none;
	}
	:global(.sx__calendar-header) {
		display: none;
	}
	:global(.sx__week-header) {
		display: none;
	}
	:global(:root) {
		--sx-color-primary: #7c3aed;
		--sx-color-on-primary: #ffffff;
		--sx-color-primary-container: #ede9fe;
		--sx-color-on-primary-container: #3b0764;
		--sx-color-background: transparent;
		--sx-color-surface: transparent;
		--sx-color-surface-container: transparent;
		--sx-color-on-surface: #1f2937;
		--sx-color-outline: #e5e7eb;
		--sx-color-outline-variant: #f1f5f9;
		--sx-internal-color-text: #1f2937;
		--sx-internal-color-light-gray: #f8fafc;
	}
	:global(.sx-svelte-calendar-wrapper) {
		font-family: 'Inter', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
	}
</style>
