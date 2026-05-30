<script lang="ts">
	import { onMount } from 'svelte';
	import { getEvents, getToken } from '$lib/api/event';
	import type { components } from '$lib/api/schema';

	type StoredEvent = components['schemas']['StoredEvent'];

	let {
		token = $bindable(''),
		onEventsSynced
	}: {
		token?: string;
		onEventsSynced?: (data: StoredEvent[]) => void;
	} = $props();

	const tokenStorageKey = 'voice_calendar_token';
	let storedToken = $state('');
	let loading = $state(false);

	const currentToken = () => token.trim() || storedToken.trim();
	const buttonText = () => (currentToken() ? '同步' : '获取token');

	const saveToken = (value: string) => {
		token = value;
		storedToken = value;
		localStorage.setItem(tokenStorageKey, value);
	};

	const handleClick = async () => {
		if (loading) return;
		loading = true;

		if (!currentToken()) {
			const data = await getToken();
			if (data !== undefined) saveToken(data);
			loading = false;
			return;
		}

		const value = currentToken();
		const data = await getEvents(value);
		if (data !== undefined) onEventsSynced?.(data);
		loading = false;
	};

	onMount(() => {
		storedToken = localStorage.getItem(tokenStorageKey) ?? '';
		if (!token && storedToken) token = storedToken;
	});
</script>

<div class="flex gap-3">
	<input
		class="min-w-0 flex-1 rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 placeholder:text-zinc-400"
		type="text"
		placeholder="输入token以同步"
		bind:value={token}
	/>
	<button
		type="button"
		class="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
		disabled={loading}
		onclick={handleClick}
	>
		{buttonText()}
	</button>
</div>
