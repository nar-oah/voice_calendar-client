<script lang="ts">
	import Calendar from '$lib/calendar/Calendar.svelte';
	import ScheduleConfirm from '$lib/ScheduleConfirm.svelte';
	import SpeechText from '$lib/speech-text/SpeechText.svelte';
	import type { components } from '$lib/api/schema';
	import type { CalendarEventExternal } from '@schedule-x/calendar';

	type Event = components['schemas']['Event'];
	type Time = components['schemas']['Time'];
	let pendingEvent = $state<Event | null>(null);
	let calendar = $state<Calendar>();

	function toScheduleXEvent(data: Event): CalendarEventExternal {
		function get_zdt(t: Time): Temporal.ZonedDateTime {
			const pad = (value: number): string => String(value).padStart(2, '0');
			const value = `${t.year}-${pad(t.month)}-${pad(t.day)}T${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)}`;
			const zone = '+08:00[Asia/Shanghai]';
			return Temporal.ZonedDateTime.from(value + zone);
		}
		return {
			id: crypto.randomUUID(),
			title: data.title,
			start: get_zdt(data.start),
			end: get_zdt(data.end),
			description: data.description ? data.description : undefined,
			location: data.location ? data.location : undefined
		};
	}
	function handleConfirm(event: Event): void {
		calendar?.addEvent(toScheduleXEvent(event));
		pendingEvent = null;
	}
</script>

<main class="flex w-full gap-8">
	<section class="flex-1">
		<SpeechText onEventRecognized={(data) => (pendingEvent = data)} />
	</section>
	<section class="flex-1">
		<Calendar bind:this={calendar} />
	</section>
</main>

{#if pendingEvent}
	<ScheduleConfirm
		data={pendingEvent}
		onCancel={() => (pendingEvent = null)}
		onCreate={(data) => handleConfirm(data)}
		onDelete={() => {}}
		onUpdate={() => {}}
	/>
{/if}
