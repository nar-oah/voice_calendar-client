<script lang="ts">
	import type { components } from '$lib/api/schema';
	import TokenAccessInfo from '$lib/sync/TokenAccessInfo.svelte';
	import TokenSync from '$lib/sync/TokenSync.svelte';

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
</script>

<main class="px-5 text-zinc-950">
	<section class="flex flex-col gap-4">
		<TokenSync bind:token {onEventsSynced} {onExport} />
		<TokenAccessInfo {token} />
	</section>
</main>
