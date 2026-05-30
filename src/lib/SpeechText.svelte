<script lang="ts">
	import { onMount } from 'svelte';
	import { getEvent } from '$lib/api/event';
	import type { components } from '$lib/api/schema';

	let {
		onEventRecognized
	}: { onEventRecognized?: (data: components['schemas']['Event']) => void } = $props();

	let supported = $state(false);
	let listening = $state(false);
	let stopping = $state(false);
	let transcript = $state('');
	let interimTranscript = $state('');
	let status = $state('正在检测浏览器支持...');
	let recognition: SpeechRecognition | null = null;
	let stopResolve: (() => void) | null = null;

	const recognizedText = () => `${transcript}${interimTranscript}`.trim();

	const startRecognition = () => {
		if (!recognition || listening || stopping) return;
		transcript = '';
		interimTranscript = '';
		status = '正在聆听...';
		recognition.start();
	};

	const stopRecognition = async () => {
		if (!recognition || !listening || stopping) return;
		stopping = true;
		status = '正在结束识别...';
		const textBeforeStop = recognizedText();
		await new Promise<void>((resolve) => {
			stopResolve = resolve;
			recognition?.stop();
		});
		const text = recognizedText() || textBeforeStop;
		if (text) {
			status = '思考中...';
			const data = await getEvent(text);
			if (data != undefined) {
				onEventRecognized?.(data);
			}
		}
		status = '识别已结束';
		stopping = false;
	};

	onMount(() => {
		const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognitionConstructor) {
			status = '当前浏览器不支持 SpeechRecognition。';
			return;
		}

		supported = true;
		status = '点击开始后说话。';

		recognition = new SpeechRecognitionConstructor();
		recognition.lang = 'zh-CN';
		recognition.continuous = true;
		recognition.interimResults = true;

		recognition.onstart = () => {
			listening = true;
			status = '正在聆听...';
		};

		recognition.onend = () => {
			listening = false;
			if (!stopping) {
				status = recognizedText() ? '思考中...' : '等待开始。';
			}
			stopResolve?.();
			stopResolve = null;
		};

		recognition.onerror = (event) => {
			listening = false;
			stopping = false;
			status = `识别失败：${event.error}`;
			stopResolve?.();
			stopResolve = null;
		};

		recognition.onresult = (event) => {
			let finalText = '';
			let interimText = '';

			for (let index = event.resultIndex; index < event.results.length; index += 1) {
				const result = event.results[index];
				const text = result[0].transcript;

				if (result.isFinal) {
					finalText += text;
				} else {
					interimText += text;
				}
			}

			transcript += finalText;
			interimTranscript = interimText;
		};

		return () => {
			recognition?.abort();
		};
	});
</script>

<main class="px-5 py-10 text-zinc-950">
	<section class="flex flex-col gap-6">
		<div>
			<p class="text-sm text-zinc-500">SpeechRecognition POC</p>
			<h1 class="mt-2 text-3xl font-semibold">语音转文本验证</h1>
		</div>

		<div class="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
			<div class="flex flex-wrap items-center gap-3">
				<button
					class="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-300"
					disabled={!supported || listening || stopping}
					onclick={startRecognition}
				>
					开始识别
				</button>
				<button
					class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-300"
					disabled={!supported || !listening || stopping}
					onclick={stopRecognition}
				>
					停止
				</button>
				<span class="text-sm text-zinc-500">{status}</span>
			</div>
		</div>

		<div class="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
			<h2 class="text-base font-medium">识别结果</h2>
			<p class="mt-4 min-h-36 whitespace-pre-wrap text-lg leading-8 text-zinc-900">
				{transcript}
				{#if interimTranscript}
					<span class="text-zinc-400">{interimTranscript}</span>
				{:else if !transcript}
					<span class="text-zinc-400">暂无内容</span>
				{/if}
			</p>
		</div>
	</section>
</main>
