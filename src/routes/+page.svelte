<script lang="ts">
	import { ScheduleXCalendar } from '@schedule-x/svelte';
	import { createCalendar, createViewDay, createViewWeek } from '@schedule-x/calendar';
	import '@schedule-x/theme-default/dist/index.css';
	import 'temporal-polyfill/global';
	import { onMount } from 'svelte';

	let calendarApp = $state();
	onMount(() => {
		calendarApp = createCalendar({
			views: [createViewDay(), createViewWeek()],
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
				}
			]
		});
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
<div>
	{#if calendarApp}
		<ScheduleXCalendar {calendarApp} />
	{/if}
</div>
