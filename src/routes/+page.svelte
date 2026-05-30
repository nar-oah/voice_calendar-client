<script lang="ts">
	import Calendar from '$lib/calendar/Calendar.svelte';
	import ScheduleConfirm from '$lib/ScheduleConfirm.svelte';
	import SpeechText from '$lib/SpeechText.svelte';
	import type { components } from '$lib/api/schema';
	import type { CalendarEventExternal } from '@schedule-x/calendar';

	type Event = components['schemas']['Event'];
	type Time = components['schemas']['Time'];
	let pendingEvent = $state<Event | null>(null);
	let calendar = $state<Calendar>();

	function getEventId(data: Event): string {
		function get_time_key(t: Time): string {
			return [t.year, t.month, t.day, t.hour, t.minute, t.second].join('-');
		}
		return [data.title, get_time_key(data.start), get_time_key(data.end)].join('|');
	}

	function toScheduleXEvent(data: Event): CalendarEventExternal {
		function get_zdt(t: Time): Temporal.ZonedDateTime {
			const pad = (value: number): string => String(value).padStart(2, '0');
			const value = `${t.year}-${pad(t.month)}-${pad(t.day)}T${pad(t.hour)}:${pad(t.minute)}:${pad(t.second)}`;
			const zone = '+08:00[Asia/Shanghai]';
			return Temporal.ZonedDateTime.from(value + zone);
		}
		return {
			id: getEventId(data),
			title: data.title,
			start: get_zdt(data.start),
			end: get_zdt(data.end),
			description: data.description ? data.description : undefined,
			location: data.location ? data.location : undefined
		};
	}

	function handleCreate(data: Event): void {
		calendar?.addEvent(toScheduleXEvent(data));
		pendingEvent = null;
	}

	function handleDelete(data: Event): void {
		calendar?.removeEvent(getEventId(data));
		pendingEvent = null;
	}

	function handleUpdate(data: Event): void {
		calendar?.updateEvent(toScheduleXEvent(data));
		pendingEvent = null;
	}
</script>

<main class="flex w-full gap-8">
	<section class="flex flex-1 flex-col gap-4">
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
		onCreate={handleCreate}
		onDelete={handleDelete}
		onUpdate={handleUpdate}
	/>
{/if}
