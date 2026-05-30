<script lang="ts">
	let {
		supported,
		listening,
		creating,
		status,
		onToggle,
		onCreate
	}: {
		supported: boolean;
		listening: boolean;
		creating: boolean;
		status: string;
		onToggle: () => void;
		onCreate: () => void | Promise<void>;
	} = $props();
</script>

<div class="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
	<div class="flex flex-wrap items-center gap-3">
		<button
			type="button"
			class="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
			disabled={!supported || creating}
			onclick={onToggle}
		>
			{listening ? '停止' : '语音输入'}
		</button>
		<button
			type="button"
			class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-300"
			disabled={creating}
			onclick={onCreate}
		>
			新建日程
		</button>
		<span class="text-sm text-zinc-500">{status}</span>
	</div>
</div>
