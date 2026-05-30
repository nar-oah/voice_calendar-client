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
	let loading = $state(false);

	const currentToken = () => token.trim();
	const buttonText = () => (token.trim() ? '同步' : '获取token');

	const saveToken = (value: string) => {
		token = value;
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
		saveToken(value);
		const data = await getEvents(value);
		if (data !== undefined) onEventsSynced?.(data);
		loading = false;
	};

	onMount(() => {
		if (!token) token = localStorage.getItem(tokenStorageKey) ?? '';
		if (token) handleClick();
	});
</script>

<main class="px-5 text-zinc-950">
	<section class="flex gap-2">
		<input
			class="min-w-0 flex-1 rounded-md b-solid b-3 b-black bg-white px-5 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400"
			type="text"
			placeholder="输入token以同步"
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
	</section>
</main>
