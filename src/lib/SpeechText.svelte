<script lang="ts">
	import { onMount } from 'svelte';
	import { getEvent } from '$lib/api/event';
	import type { components } from '$lib/api/schema';

	let {
		onEventRecognized
	}: { onEventRecognized?: (data: components['schemas']['Event']) => void } = $props();

	let supported = $state(false);
	let listening = $state(false);
	let transcript = $state('');
	let interimTranscript = $state('');
	let status = $state('正在检测浏览器支持...');
	let creating = $state(false);
	let recognition: SpeechRecognition | null = null;
	let createOnEnd = false;

	type Event = components['schemas']['Event'];
	type Time = components['schemas']['Time'];

	const getCurrentTime = (): Time => {
		const now = new Date();
		return {
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate(),
			hour: now.getHours(),
			minute: now.getMinutes(),
			second: now.getSeconds()
		};
	};

	const getEmptyEvent = (): Event => {
		const now = getCurrentTime();
		return {
			action: 'create',
			title: '',
			start: now,
			end: { ...now },
			location: null,
			description: null
		};
	};

	const commitInterimTranscript = () => {
		if (!interimTranscript) return;
		transcript += interimTranscript;
		interimTranscript = '';
	};

	const getRecognizedText = () => `${transcript}${interimTranscript}`.trim();

	const submitSchedule = async () => {
		const text = getRecognizedText();
		if (!text) {
			onEventRecognized?.(getEmptyEvent());
			status = '已生成空白日程';
			return;
		}

		status = '思考中...';
		const data = await getEvent(text);
		if (data != undefined) {
			onEventRecognized?.(data);
		}
		status = '识别已结束';
	};

	const startRecognition = () => {
		if (!recognition || listening || creating) return;
		createOnEnd = false;
		status = '正在聆听...';
		recognition.start();
	};

	const stopRecognition = () => {
		if (!recognition || !listening) return;
		createOnEnd = false;
		status = '正在停止...';
		recognition.stop();
	};

	const toggleRecognition = () => {
		if (listening) {
			stopRecognition();
		} else {
			startRecognition();
		}
	};

	const createSchedule = async () => {
		if (creating) return;
		creating = true;

		if (recognition && listening) {
			createOnEnd = true;
			status = '正在整理识别内容...';
			recognition.stop();
			return;
		}

		await submitSchedule();
		creating = false;
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

		recognition.onend = async () => {
			listening = false;
			commitInterimTranscript();

			if (createOnEnd) {
				await submitSchedule();
				createOnEnd = false;
				creating = false;
				return;
			}

			status = transcript ? '识别已停止，可继续开始或新建日程。' : '等待开始。';
		};

		recognition.onerror = (event) => {
			listening = false;
			creating = false;
			createOnEnd = false;
			status = `识别失败：${event.error}`;
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
					disabled={!supported || creating}
					onclick={toggleRecognition}
				>
					{listening ? '停止' : '开始识别'}
				</button>
				<button
					class="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 disabled:cursor-not-allowed disabled:text-zinc-300"
					disabled={creating}
					onclick={createSchedule}
				>
					新建日程
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
