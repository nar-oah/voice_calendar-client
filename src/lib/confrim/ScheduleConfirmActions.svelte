<script lang="ts">
	import {
		confirmButtonClass,
		confirmText,
		editButtonClass,
		type ScheduleEvent
	} from './scheduleConfirm';

	let {
		action,
		onCancel
	}: {
		action: ScheduleEvent['action'];
		onCancel?: () => void;
	} = $props();
</script>

<div class="mt-5 flex justify-end gap-3">
	<button type="button" class={editButtonClass} onclick={() => onCancel?.()}> 取消 </button>
	<button
		type="submit"
		class={`rounded-lg b-2 b-solid px-4 py-2 text-sm font-medium shadow-sm transition ${confirmButtonClass[action]}`}
	>
		{confirmText[action]}
	</button>
</div>
