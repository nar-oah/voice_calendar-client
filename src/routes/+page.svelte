<script lang="ts">
	import Calendar from '$lib/calendar/Calendar.svelte';
	import ScheduleConfirm from '$lib/ScheduleConfirm.svelte';
	import SpeechText from '$lib/speech-text/SpeechText.svelte';
	import TokenSync from '$lib/sync/TokenSync.svelte';
	import type { components } from '$lib/api/schema';
	import type { CalendarEventExternal } from '@schedule-x/calendar';
	import { addEvents, delEvents } from '$lib/api/event';

	type Event = components['schemas']['Event'];
	type Time = components['schemas']['Time'];
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
	async function handleCreate(event: Event): Promise<void> {
		const data = await addEvents(token, event);
		if (data) calendar?.addEvent(getCalendarEvent(data));
		pendingEvent = null;
	}
	async function handleDelete(id: number): Promise<void> {
		calendar?.delEvent(id);
		await delEvents(token, id);
		pendingEvent = null;
	}
	function handleRead(time: Time): void {
		function get_zdt(t: Time): Temporal.ZonedDateTime {
			const pad = (value: number): string => String(value).padStart(2, '0');
			const value = `${t.year}-${pad(t.month)}-${pad(t.day)}T${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)}`;
			const zone = '+08:00[Asia/Shanghai]';
			return Temporal.ZonedDateTime.from(value + zone);
		}
		calendar?.readEvent(get_zdt(time));
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
		onCreate={(data) => handleCreate(data)}
		onDelete={handleDelete}
		onRead={handleRead}
	/>
{/if}
