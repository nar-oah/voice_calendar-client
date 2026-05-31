<script lang="ts">
	import Calendar from '$lib/calendar/Calendar.svelte';
	import ScheduleConfirm from '$lib/ScheduleConfirm.svelte';
	import SpeechText from '$lib/speech-text/SpeechText.svelte';
	import SyncPanel from '$lib/sync/SyncPanel.svelte';
	import type { components } from '$lib/api/schema';
	import type { CalendarEventExternal } from '@schedule-x/calendar';
	import { addEvents, delEvents, getIcs } from '$lib/api/event';
	import { addReminder } from '$lib/api/remind';

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
	async function addCalendar(data: StoredEvent): Promise<void> {
		calendar?.addEvent(getCalendarEvent(data));
		await addReminder(data.title, data.start_at);
	}
	async function handleCreate(event: Event): Promise<void> {
		const data = await addEvents(token, event);
		if (data) await addCalendar(data);
		pendingEvent = null;
	}
	async function handleDelete(id: number): Promise<void> {
		calendar?.delEvent(id);
		pendingEvent = null;
		await delEvents(token, id);
	}
	function handleRead(time: Time): void {
		function get_pd(t: Time): Temporal.PlainDate {
			const pad = (value: number): string => String(value).padStart(2, '0');
			return Temporal.PlainDate.from(`${t.year}-${pad(t.month)}-${pad(t.day)}`);
		}
		calendar?.readEvent(get_pd(time));
		pendingEvent = null;
	}
	async function handleEventsSynced(data: StoredEvent[]): Promise<void> {
		data.map(async (event: StoredEvent) => await addCalendar(event));
	}
	function handleExport(): void {
		const date = calendar?.get_date();
		if (date) getIcs(token, date);
	}
</script>

<main class="flex w-full gap-8">
	<section class="flex flex-1 flex-col gap-2">
		<SpeechText {token} onEventRecognized={(data) => (pendingEvent = data)} />
		<SyncPanel bind:token onEventsSynced={handleEventsSynced} />
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
