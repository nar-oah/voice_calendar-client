<script lang="ts">
	import {
		actionBadgeClass,
		actionText,
		editButtonClass,
		type EditableEvent
	} from './scheduleConfirm';

	let {
		draft,
		editing,
		onToggle
	}: {
		draft: EditableEvent;
		editing: boolean;
		onToggle: () => void;
	} = $props();
</script>

<div class="flex flex-wrap items-start justify-between gap-4">
	<div class="grid gap-2">
		<span
			class={`w-fit rounded-md px-3 py-1 text-sm font-medium ${actionBadgeClass[draft.action]}`}
		>
			{actionText[draft.action]}
		</span>
		{#if editing}
			<h2 id="schedule-confirm-title" class="sr-only">{draft.title || '未命名日程'}</h2>
		{:else}
			<p class="text-sm text-zinc-500">待确认操作</p>
			<h2 id="schedule-confirm-title" class="mt-1 text-xl font-semibold text-zinc-950">
				{draft.title || '未命名日程'}
			</h2>
		{/if}
	</div>
	<div class="flex items-center">
		<button type="button" class={editButtonClass} onclick={onToggle}>
			{editing ? '完成编辑' : '修改'}
		</button>
	</div>
</div>
