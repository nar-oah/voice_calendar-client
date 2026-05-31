<script lang="ts">
	import { formatTime, type EditableEvent } from './scheduleConfirm';

	let {
		draft
	}: {
		draft: EditableEvent;
	} = $props();
</script>

<dl class="mt-5 grid gap-3 text-sm">
	<div class="grid grid-cols-[4rem_1fr] gap-3">
		<dt class="text-zinc-500">开始</dt>
		<dd class="text-zinc-950">{formatTime(draft.start)}</dd>
	</div>
	<div class="grid grid-cols-[4rem_1fr] gap-3">
		<dt class="text-zinc-500">结束</dt>
		<dd class="text-zinc-950">{formatTime(draft.end)}</dd>
	</div>
	<div class="grid grid-cols-[4rem_1fr] gap-3">
		<dt class="text-zinc-500">地点</dt>
		<dd class="text-zinc-950">{draft.location || '无'}</dd>
	</div>
	<div class="grid grid-cols-[4rem_1fr] gap-3">
		<dt class="text-zinc-500">备注</dt>
		<dd class="whitespace-pre-wrap text-zinc-950">{draft.description || '无'}</dd>
	</div>
</dl>
