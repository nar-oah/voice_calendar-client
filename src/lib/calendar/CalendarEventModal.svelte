<script lang="ts">
	import { getContext } from 'svelte';
	import type { CalendarEventExternal } from '@schedule-x/calendar';
	import { confirmButtonClass, editButtonClass } from '$lib/confrim/scheduleConfirm';
	import {
		calendarEventModalContextKey,
		type CalendarEventModalContext
	} from './calendarEventModalContext';

	type CalendarDate = CalendarEventExternal['start'];

	let {
		calendarEvent
	}: {
		calendarEvent?: CalendarEventExternal;
	} = $props();

	const actions = getContext<CalendarEventModalContext | undefined>(calendarEventModalContextKey);
	const pad = (value: number): string => String(value).padStart(2, '0');
	const isZonedDateTime = (value: CalendarDate): value is Temporal.ZonedDateTime =>
		value instanceof Temporal.ZonedDateTime;
	const formatDate = (value: CalendarDate): string =>
		isZonedDateTime(value)
			? `${value.year}-${pad(value.month)}-${pad(value.day)} ${pad(value.hour)}:${pad(value.minute)}`
			: `${value.year}-${pad(value.month)}-${pad(value.day)}`;
	const getEventId = (id: CalendarEventExternal['id'] | undefined): number | null => {
		if (typeof id === 'number') return id;
		if (typeof id !== 'string') return null;
		const value = Number(id);
		return Number.isFinite(value) ? value : null;
	};

	let title = $derived(calendarEvent?.title?.trim() || '未命名日程');
	let eventId = $derived(getEventId(calendarEvent?.id));
	let canDelete = $derived(Boolean(actions && eventId !== null));

	function handleDelete(): void {
		if (eventId === null) return;
		actions?.deleteEvent(eventId);
	}
</script>

{#if calendarEvent}
	<div class="rounded-lg b-3 b-solid b-black bg-white p-5 text-zinc-950">
		<div class="grid gap-2">
			<span class="w-fit rounded-md bg-red-600 px-3 py-1 text-sm font-medium text-white">日程</span>
			<h2 class="text-xl font-semibold">{title}</h2>
		</div>

		<dl class="mt-5 grid gap-3 text-sm">
			<div class="grid grid-cols-[4rem_1fr] gap-3">
				<dt class="text-zinc-500">开始</dt>
				<dd>{formatDate(calendarEvent.start)}</dd>
			</div>
			<div class="grid grid-cols-[4rem_1fr] gap-3">
				<dt class="text-zinc-500">结束</dt>
				<dd>{formatDate(calendarEvent.end)}</dd>
			</div>
			<div class="grid grid-cols-[4rem_1fr] gap-3">
				<dt class="text-zinc-500">地点</dt>
				<dd>{calendarEvent.location || '无'}</dd>
			</div>
			<div class="grid grid-cols-[4rem_1fr] gap-3">
				<dt class="text-zinc-500">备注</dt>
				<dd class="whitespace-pre-wrap">{calendarEvent.description || '无'}</dd>
			</div>
		</dl>

		<div class="mt-5 flex justify-end gap-3">
			<button type="button" class={editButtonClass} onclick={() => actions?.close()}>取消</button>
			<button
				type="button"
				class={`rounded-lg b-2 b-solid px-4 py-2 text-sm font-medium shadow-sm transition ${confirmButtonClass.delete} disabled:cursor-not-allowed disabled:b-zinc-400 disabled:bg-zinc-400`}
				disabled={!canDelete}
				onclick={handleDelete}
			>
				删除
			</button>
		</div>
	</div>
{/if}
