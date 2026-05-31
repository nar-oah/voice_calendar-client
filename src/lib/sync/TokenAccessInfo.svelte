<script lang="ts">
	import { onDestroy } from 'svelte';

	type CopyTarget = 'caldav' | 'token';

	let { token }: { token: string } = $props();
	let copied = $state<CopyTarget | null>(null);
	let copyTimer: number | undefined;

	const caldavAddress = $derived(`aws.naroah.top/radicale/${token}`);

	const copyText = async (target: CopyTarget, text: string) => {
		await navigator.clipboard.writeText(text);
		copied = target;

		if (copyTimer) window.clearTimeout(copyTimer);
		copyTimer = window.setTimeout(() => {
			if (copied === target) copied = null;
		}, 1200);
	};

	onDestroy(() => {
		if (copyTimer) window.clearTimeout(copyTimer);
	});
</script>

<div class="rounded-lg b-solid b-3 b-black bg-amber-500 p-5">
	<div class="flex flex-col gap-3">
		<div class="flex items-center gap-3">
			<span class="w-26 shrink-0 text-base font-medium text-black">Caldav地址：</span>
			<button
				type="button"
				class="min-w-0 flex-1 rounded-md b-solid b-3 b-black px-4 py-2 text-left text-sm font-medium break-all text-zinc-900"
				onclick={() => copyText('caldav', caldavAddress)}
			>
				{copied === 'caldav' ? '已复制' : caldavAddress}
			</button>
		</div>
		<div class="flex items-center gap-3">
			<span class="w-26 shrink-0 text-base font-medium text-black">用户名&密码</span>
			<button
				type="button"
				class="min-w-0 flex-1 rounded-md b-solid b-3 b-black px-4 py-2 text-left text-sm font-medium break-all text-zinc-900"
				onclick={() => copyText('token', token)}
			>
				{copied === 'token' ? '已复制' : token || '请先获取Token'}
			</button>
		</div>
	</div>
</div>
