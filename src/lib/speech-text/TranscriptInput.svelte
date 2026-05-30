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
		class={`mt-4 min-h-36 w-full resize-y rounded-md border border-zinc-300 px-3 py-2 text-lg leading-8 outline-none focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950/10 ${readonly ? 'cursor-not-allowed bg-zinc-50 text-zinc-500' : 'bg-white text-zinc-950'}`}
		placeholder="暂无内容"
		rows="5"
		{readonly}
		aria-readonly={readonly}
		bind:value
	></textarea>
</div>
