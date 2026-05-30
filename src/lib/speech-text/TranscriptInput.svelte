<script lang="ts">
	let {
		value = $bindable(''),
		readonly = false
	}: {
		value?: string;
		readonly?: boolean;
	} = $props();
</script>

<div class="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
	<label for="speech-transcript" class="text-base font-medium">识别结果</label>
	<textarea
		id="speech-transcript"
		class={`mt-4 block min-h-36 w-full box-border resize-y border-0 bg-transparent p-0 text-lg leading-8 outline-none ${readonly ? 'cursor-not-allowed text-zinc-500' : 'text-zinc-950'}`}
		placeholder="暂无内容"
		rows="5"
		{readonly}
		aria-readonly={readonly}
		bind:value
	></textarea>
</div>
