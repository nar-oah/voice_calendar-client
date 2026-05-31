<script lang="ts">
	import { smallFieldClass } from './scheduleConfirm';

	let {
		label,
		value = $bindable(),
		min,
		max
	}: {
		label: string;
		value: number;
		min: number;
		max?: number;
	} = $props();
</script>

<label class="grid gap-1">
	<span class="text-xs text-zinc-500">{label}</span>
	<input class={smallFieldClass} type="number" {min} {max} step="1" bind:value required />
</label>
