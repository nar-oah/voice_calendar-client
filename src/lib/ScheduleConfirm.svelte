<script lang="ts">
	import type { components } from '$lib/api/schema';

	type ScheduleEvent = components['schemas']['Event'];
	type ScheduleTime = components['schemas']['Time'];
	type EditableEvent = Omit<ScheduleEvent, 'start' | 'end' | 'location' | 'description'> & {
		start: ScheduleTime;
		end: ScheduleTime;
		location: string;
		description: string;
	};

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

	const actionText = {
		create: '新建',
		delete: '删除',
		read: '查看'
	} satisfies Record<ScheduleEvent['action'], string>;

	const confirmText = {
		create: '确认创建',
		delete: '确认删除',
		read: '跳转日期'
	} satisfies Record<ScheduleEvent['action'], string>;

	const actionBadgeClass = {
		create: 'bg-zinc-950 text-white',
		delete: 'bg-red-600 text-white',
		read: 'bg-amber-500 text-zinc-950'
	} satisfies Record<ScheduleEvent['action'], string>;

	const confirmButtonClass = {
		create: 'bg-zinc-950 text-white hover:bg-zinc-800',
		delete: 'bg-red-600 text-white hover:bg-red-700',
		read: 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
	} satisfies Record<ScheduleEvent['action'], string>;

	const pad = (value: number) => String(value).padStart(2, '0');
	const formatTime = (time: ScheduleTime) =>
		`${time.year}-${pad(time.month)}-${pad(time.day)} ${pad(time.hour)}:${pad(time.minute)}:${pad(time.second)}`;
	const copyTime = (time: ScheduleTime): ScheduleTime => ({ ...time });
	const copyEvent = (event: ScheduleEvent): EditableEvent => ({
		id: event.id,
		action: event.action,
		title: event.title,
		start: copyTime(event.start),
		end: copyTime(event.end),
		location: event.location ?? '',
		description: event.description ?? ''
	});
	const normalizeText = (value: string): string | null => {
		const text = value.trim();
		return text ? text : null;
	};
	const normalizeEvent = (): ScheduleEvent => ({
		id: draft.id,
		action: draft.action,
		title: draft.title.trim(),
		start: copyTime(draft.start),
		end: copyTime(draft.end),
		location: normalizeText(draft.location),
		description: normalizeText(draft.description)
	});

	let draft = $state<EditableEvent>({
		id: 0,
		action: 'create',
		title: '',
		start: { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
		end: { year: 0, month: 1, day: 1, hour: 0, minute: 0, second: 0 },
		location: '',
		description: ''
	});
	let editing = $state(false);

	$effect(() => {
		draft = copyEvent(data);
		editing = false;
	});

	const confirm = (submitEvent: SubmitEvent) => {
		submitEvent.preventDefault();
		const scheduleEvent = normalizeEvent();
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
		class="relative max-h-[calc(100vh-2rem)] w-full max-w-2xl overflow-y-auto rounded-lg border border-zinc-200 bg-white p-5 shadow-xl"
		role="dialog"
		aria-modal="true"
		aria-labelledby="schedule-confirm-title"
	>
		<form onsubmit={confirm}>
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<p class="text-sm text-zinc-500">待确认操作</p>
					<h2 id="schedule-confirm-title" class="mt-1 text-xl font-semibold text-zinc-950">
						{draft.title || '未命名日程'}
					</h2>
				</div>
				<div class="flex items-center gap-2">
					<span
						class={`rounded-md px-3 py-1 text-sm font-medium ${actionBadgeClass[draft.action]}`}
					>
						{actionText[draft.action]}
					</span>
					<button
						type="button"
						class="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
						onclick={() => (editing = !editing)}
					>
						{editing ? '完成编辑' : '修改'}
					</button>
				</div>
			</div>

			{#if editing}
				<div class="mt-5 grid gap-4 text-sm">
					<label class="grid gap-1.5">
						<span class="text-zinc-500">操作</span>
						<select
							class="rounded-md border border-zinc-300 bg-white px-3 py-2 text-zinc-950"
							bind:value={draft.action}
						>
							<option value="create">新建</option>
							<option value="delete">删除</option>
							<option value="update">查看</option>
						</select>
					</label>

					<label class="grid gap-1.5">
						<span class="text-zinc-500">标题</span>
						<input
							class="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950"
							type="text"
							bind:value={draft.title}
							required
						/>
					</label>

					<div class="grid gap-3 sm:grid-cols-2">
						<fieldset class="rounded-md border border-zinc-200 p-3">
							<legend class="px-1 text-zinc-500">开始时间</legend>
							<div class="grid grid-cols-3 gap-2">
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">年</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="1"
										step="1"
										bind:value={draft.start.year}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">月</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="1"
										max="12"
										step="1"
										bind:value={draft.start.month}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">日</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="1"
										max="31"
										step="1"
										bind:value={draft.start.day}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">时</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="0"
										max="23"
										step="1"
										bind:value={draft.start.hour}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">分</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="0"
										max="59"
										step="1"
										bind:value={draft.start.minute}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">秒</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="0"
										max="59"
										step="1"
										bind:value={draft.start.second}
										required
									/>
								</label>
							</div>
						</fieldset>

						<fieldset class="rounded-md border border-zinc-200 p-3">
							<legend class="px-1 text-zinc-500">结束时间</legend>
							<div class="grid grid-cols-3 gap-2">
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">年</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="1"
										step="1"
										bind:value={draft.end.year}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">月</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="1"
										max="12"
										step="1"
										bind:value={draft.end.month}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">日</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="1"
										max="31"
										step="1"
										bind:value={draft.end.day}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">时</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="0"
										max="23"
										step="1"
										bind:value={draft.end.hour}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">分</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="0"
										max="59"
										step="1"
										bind:value={draft.end.minute}
										required
									/>
								</label>
								<label class="grid gap-1">
									<span class="text-xs text-zinc-500">秒</span>
									<input
										class="rounded-md border border-zinc-300 px-2 py-2"
										type="number"
										min="0"
										max="59"
										step="1"
										bind:value={draft.end.second}
										required
									/>
								</label>
							</div>
						</fieldset>
					</div>

					<label class="grid gap-1.5">
						<span class="text-zinc-500">地点</span>
						<input
							class="rounded-md border border-zinc-300 px-3 py-2 text-zinc-950"
							type="text"
							bind:value={draft.location}
						/>
					</label>

					<label class="grid gap-1.5">
						<span class="text-zinc-500">备注</span>
						<textarea
							class="min-h-24 rounded-md border border-zinc-300 px-3 py-2 text-zinc-950"
							bind:value={draft.description}
						></textarea>
					</label>
				</div>
			{:else}
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
			{/if}

			<div class="mt-5 flex justify-end gap-3">
				<button
					type="button"
					class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
					onclick={() => onCancel?.()}
				>
					取消
				</button>
				<button
					type="submit"
					class={`rounded-md px-4 py-2 text-sm font-medium ${confirmButtonClass[draft.action]}`}
				>
					{confirmText[draft.action]}
				</button>
			</div>
		</form>
	</div>
</div>
