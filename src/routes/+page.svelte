<script lang="ts">
	import Calendar from '$lib/calendar/Calendar.svelte';
	import ScheduleConfirm from '$lib/ScheduleConfirm.svelte';
	import SpeechText from '$lib/SpeechText.svelte';
	import type { components } from '$lib/api/schema';

	let pendingEvent = $state<components['schemas']['Event'] | null>(null);
</script>

<main class="flex min-h-screen w-full gap-8">
	<section class="flex flex-1 flex-col gap-4">
		<SpeechText onEventRecognized={(data) => (pendingEvent = data)} />
		{#if pendingEvent}
			<ScheduleConfirm
				data={pendingEvent}
				onCancel={() => (pendingEvent = null)}
				onConfirm={() => (pendingEvent = null)}
			/>
		{/if}
	</section>
	<section class="flex-1">
		<Calendar />
	</section>
</main>
