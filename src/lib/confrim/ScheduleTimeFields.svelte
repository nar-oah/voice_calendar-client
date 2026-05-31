<script lang="ts">
	import type { ScheduleTime } from './scheduleConfirm';
	import ScheduleNumberInput from './ScheduleNumberInput.svelte';

	let {
		label,
		time = $bindable()
	}: {
		label: string;
		time: ScheduleTime;
	} = $props();
</script>

<fieldset class="rounded-md b-2 b-solid b-zinc-200 p-3">
	<legend class="px-1 text-zinc-500">{label}</legend>
	<div class="grid grid-cols-3 gap-2">
		<ScheduleNumberInput label="年" min={1} bind:value={time.year} />
		<ScheduleNumberInput label="月" min={1} max={12} bind:value={time.month} />
		<ScheduleNumberInput label="日" min={1} max={31} bind:value={time.day} />
		<ScheduleNumberInput label="时" min={0} max={23} bind:value={time.hour} />
		<ScheduleNumberInput label="分" min={0} max={59} bind:value={time.minute} />
		<ScheduleNumberInput label="秒" min={0} max={59} bind:value={time.second} />
	</div>
</fieldset>
