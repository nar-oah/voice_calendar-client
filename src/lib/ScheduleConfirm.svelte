<script lang="ts">
	import type { components } from '$lib/api/schema';

	type ScheduleEvent = components['schemas']['Event'];
	type ScheduleTime = components['schemas']['Time'];

	let {
		data,
		onConfirm,
		onCancel
	}: {
		data: ScheduleEvent;
		onConfirm?: (data: ScheduleEvent) => void;
		onCancel?: () => void;
	} = $props();

	const actionText = {
		create: '新建',
		delete: '删除',
		update: '更新'
	} satisfies Record<ScheduleEvent['action'], string>;

	const pad = (value: number) => String(value).padStart(2, '0');
	const formatTime = (time: ScheduleTime) =>
		`${time.year}-${pad(time.month)}-${pad(time.day)} ${pad(time.hour)}:${pad(time.minute)}`;
</script>

<section class="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
	<div class="flex items-start justify-between gap-4">
		<div>
			<p class="text-sm text-zinc-500">待确认操作</p>
			<h2 class="mt-1 text-xl font-semibold text-zinc-950">{data.title}</h2>
		</div>
		<span class="rounded-md bg-zinc-950 px-3 py-1 text-sm font-medium text-white">
			{actionText[data.action]}
		</span>
	</div>

	<dl class="mt-5 grid gap-3 text-sm">
		<div class="grid grid-cols-[4rem_1fr] gap-3">
			<dt class="text-zinc-500">开始</dt>
			<dd class="text-zinc-950">{formatTime(data.start)}</dd>
		</div>
		<div class="grid grid-cols-[4rem_1fr] gap-3">
			<dt class="text-zinc-500">结束</dt>
			<dd class="text-zinc-950">{formatTime(data.end)}</dd>
		</div>
		{#if data.location}
			<div class="grid grid-cols-[4rem_1fr] gap-3">
				<dt class="text-zinc-500">地点</dt>
				<dd class="text-zinc-950">{data.location}</dd>
			</div>
		{/if}
		{#if data.description}
			<div class="grid grid-cols-[4rem_1fr] gap-3">
				<dt class="text-zinc-500">备注</dt>
				<dd class="text-zinc-950">{data.description}</dd>
			</div>
		{/if}
	</dl>

	<div class="mt-5 flex justify-end gap-3">
		<button
			class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900"
			onclick={() => onCancel?.()}
		>
			取消
		</button>
		<button
			class="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white"
			onclick={() => onConfirm?.(data)}
		>
			确认
		</button>
	</div>
</section>
