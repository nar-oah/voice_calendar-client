<script lang="ts">
	import Calendar from '$lib/calendar/Calendar.svelte';
	import SpeechText from '$lib/SpeechText.svelte';
</script>

<main class="flex min-h-screen w-full gap-8">
	<section class="flex-1">
		<SpeechText />
	</section>
	<section class="flex-1">
		<Calendar />
	</section>
</main>
