<script lang="ts">
	import ScheduleConfirmActions from './ScheduleConfirmActions.svelte';
	import ScheduleConfirmEditor from './ScheduleConfirmEditor.svelte';
	import ScheduleConfirmHeader from './ScheduleConfirmHeader.svelte';
	import ScheduleConfirmSummary from './ScheduleConfirmSummary.svelte';
	import {
		copyEvent,
		emptyEvent,
		normalizeEvent,
		type ScheduleEvent,
		type ScheduleTime
	} from './scheduleConfirm';

	let {
		data,
		onCreate,
		onDelete,
		onRead,
		onCancel
	}: {
		data: ScheduleEvent;
		onCreate?: (data: ScheduleEvent) => void;
		onDelete?: (id: number) => void;
		onRead?: (time: ScheduleTime) => void;
		onCancel?: () => void;
	} = $props();

	let draft = $state(emptyEvent());
	let editing = $state(false);

	$effect(() => {
		draft = copyEvent(data);
		editing = false;
	});

	const confirm = (submitEvent: SubmitEvent) => {
		submitEvent.preventDefault();
		const scheduleEvent = normalizeEvent(draft);
		if (scheduleEvent.action === 'create') onCreate?.(scheduleEvent);
		if (scheduleEvent.action === 'delete') onDelete?.(scheduleEvent.id);
		if (scheduleEvent.action === 'read') onRead?.(scheduleEvent.start);
	};
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4">
	<button
		type="button"
		class="absolute inset-0 bg-zinc-950/40"
		aria-label="关闭确认弹窗"
		onclick={() => onCancel?.()}
	></button>

	<div
		class="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg b-3 b-solid b-black bg-white p-5 shadow-xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="schedule-confirm-title"
	>
		<form onsubmit={confirm}>
			<ScheduleConfirmHeader {draft} {editing} onToggle={() => (editing = !editing)} />

			{#if editing}
				<ScheduleConfirmEditor bind:draft />
			{:else}
				<ScheduleConfirmSummary {draft} />
			{/if}

			<ScheduleConfirmActions action={draft.action} {onCancel} />
		</form>
	</div>
</div>
