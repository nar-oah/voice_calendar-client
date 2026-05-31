<script lang="ts">
	import { fieldClass, type EditableEvent } from './scheduleConfirm';
	import ScheduleTimeFields from './ScheduleTimeFields.svelte';

	let {
		draft = $bindable()
	}: {
		draft: EditableEvent;
	} = $props();
</script>

<div class="mt-5 grid gap-4 text-sm">
	<label class="grid gap-1.5">
		<span class="text-zinc-500">操作</span>
		<select class={fieldClass} bind:value={draft.action}>
			<option value="create">新建</option>
			<option value="delete">删除</option>
			<option value="read">查看</option>
		</select>
	</label>

	<label class="grid gap-1.5">
		<span class="text-zinc-500">标题</span>
		<input class={fieldClass} type="text" bind:value={draft.title} required />
	</label>

	<div class="grid gap-3 sm:grid-cols-2">
		<ScheduleTimeFields label="开始时间" bind:time={draft.start} />
		<ScheduleTimeFields label="结束时间" bind:time={draft.end} />
	</div>

	<label class="grid gap-1.5">
		<span class="text-zinc-500">地点</span>
		<input class={fieldClass} type="text" bind:value={draft.location} />
	</label>

	<label class="grid gap-1.5">
		<span class="text-zinc-500">备注</span>
		<textarea class={`min-h-24 ${fieldClass}`} bind:value={draft.description}></textarea>
	</label>
</div>
