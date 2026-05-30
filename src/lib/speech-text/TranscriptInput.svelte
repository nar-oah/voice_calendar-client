<script lang="ts">
	let {
		value = $bindable(''),
		readonly = false
	}: {
		value?: string;
		readonly?: boolean;
	} = $props();
</script>

<div class="rounded-lg b-solid b-3 b-black bg-white p-5">
	<label for="speech-transcript" class="text-base font-medium">您的需求是?</label>
	<textarea
		id="speech-transcript"
		class={`mt-4 block min-h-36 w-full box-border resize-y border-0 bg-transparent p-0 text-lg leading-8 outline-none ${readonly ? 'cursor-not-allowed text-zinc-500' : 'text-zinc-950'}`}
		placeholder="十分钟后提醒我喝水..."
		rows="5"
		{readonly}
		aria-readonly={readonly}
		bind:value
	></textarea>
</div>
