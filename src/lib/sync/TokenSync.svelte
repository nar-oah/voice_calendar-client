<script lang="ts">
	import { onMount } from 'svelte';
	import { getEvents, getToken } from '$lib/api/event';
	import { getStorageItem, setStorageItem } from '$lib/bridge/storage';
	import type { components } from '$lib/api/schema';

	type StoredEvent = components['schemas']['StoredEvent'];

	let {
		token = $bindable(''),
		onEventsSynced,
		onExport
	}: {
		token?: string;
		onEventsSynced?: (data: StoredEvent[]) => void;
		onExport?: () => void;
	} = $props();

	const tokenStorageKey = 'voice_calendar_token';
	let loading = $state(false);
	let showExport = $state(false);

	const currentToken = () => token.trim();
	const buttonText = () => (token.trim() ? '同步' : '获取Token');

	const saveToken = async (value: string) => {
		token = value;
		await setStorageItem(tokenStorageKey, value);
	};

	const handleClick = async () => {
		if (loading) return;
		loading = true;

		if (!currentToken()) {
			const data = await getToken();
			if (data !== undefined) await saveToken(data);
			loading = false;
			return;
		}

		const value = currentToken();
		await saveToken(value);
		const data = await getEvents(value);
		if (data !== undefined) {
			onEventsSynced?.(data);
			showExport = true;
		}
		loading = false;
	};

	onMount(() => {
		void (async () => {
			if (!token) token = (await getStorageItem(tokenStorageKey)) ?? '';
			await handleClick();
		})();
	});
</script>

<section class="flex gap-2">
	<input
		class="min-w-0 flex-1 rounded-md b-solid b-3 b-black bg-white px-5 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
		type="text"
		placeholder="输入Token以同步"
		bind:value={token}
	/>
	<button
		type="button"
		class="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
		disabled={loading}
		onclick={handleClick}
	>
		{buttonText()}
	</button>
	{#if showExport}
		<button
			type="button"
			class="rounded-lg b-2 b-solid b-zinc-950 bg-white px-4 py-2 text-sm font-medium whitespace-nowrap text-zinc-950 shadow-sm transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:b-zinc-400 disabled:text-zinc-400"
			disabled={loading}
			onclick={() => onExport?.()}
		>
			导出
		</button>
	{/if}
</section>
