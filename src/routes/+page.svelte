<script lang="ts">
	import Calendar from '$lib/calendar/Calendar.svelte';
	import ScheduleConfirm from '$lib/ScheduleConfirm.svelte';
	import SpeechText from '$lib/speech-text/SpeechText.svelte';
	import TokenSync from '$lib/sync/TokenSync.svelte';
	import type { components } from '$lib/api/schema';
	import type { CalendarEventExternal } from '@schedule-x/calendar';
	import { addEvents } from '$lib/api/event';

	type Event = components['schemas']['Event'];
	type StoredEvent = components['schemas']['StoredEvent'];
	let pendingEvent = $state<Event | null>(null);
	let calendar = $state<Calendar>();
	let token = $state('');

	function getCalendarEvent(data: StoredEvent): CalendarEventExternal {
		const get_zdt = (value: string): Temporal.ZonedDateTime =>
			Temporal.Instant.fromEpochMilliseconds(new Date(value).getTime()).toZonedDateTimeISO(
				'Asia/Shanghai'
			);
		return {
			id: data.id,
			title: data.title,
			start: get_zdt(data.start_at),
			end: get_zdt(data.end_at),
			description: data.description ? data.description : undefined,
			location: data.location ? data.location : undefined
		};
	}
	async function handleConfirm(event: Event): Promise<void> {
		const data = await addEvents(token, event);
		console.log(data);
		if (data) calendar?.addEvent(getCalendarEvent(data));
		pendingEvent = null;
	}
	function handleEventsSynced(data: StoredEvent[]): void {
		data.map((event: StoredEvent) => calendar?.addEvent(getCalendarEvent(event)));
	}
</script>

<main class="flex w-full gap-8">
	<section class="flex flex-1 flex-col gap-4">
		<SpeechText {token} onEventRecognized={(data) => (pendingEvent = data)} />
		<TokenSync bind:token onEventsSynced={handleEventsSynced} />
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
