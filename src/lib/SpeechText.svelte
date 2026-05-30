<script lang="ts">
	import { onMount } from 'svelte';
	import { getEvent } from '$lib/api/event';
	import { getEmptyEvent, type ScheduleEvent } from '$lib/speech-text/eventDefaults';
	import SpeechControls from '$lib/speech-text/SpeechControls.svelte';
	import SpeechHeader from '$lib/speech-text/SpeechHeader.svelte';
	import TranscriptInput from '$lib/speech-text/TranscriptInput.svelte';

	let { onEventRecognized }: { onEventRecognized?: (data: ScheduleEvent) => void } = $props();

	let supported = $state(false);
	let listening = $state(false);
	let transcript = $state('');
	let status = $state('正在检测浏览器支持...');
	let creating = $state(false);
	let recognition: SpeechRecognition | null = null;
	let createOnEnd = false;
	let committedTranscript = '';

	const getRecognizedText = () => transcript.trim();

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
		committedTranscript = transcript;
		listening = true;
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
			committedTranscript = transcript;

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

			committedTranscript += finalText;
			transcript = `${committedTranscript}${interimText}`;
		};

		return () => {
			recognition?.abort();
		};
	});
</script>

<main class="px-5 py-10 text-zinc-950">
	<section class="flex flex-col gap-6">
		<SpeechHeader />
		<SpeechControls
			{supported}
			{listening}
			{creating}
			{status}
			onToggle={toggleRecognition}
			onCreate={createSchedule}
		/>
		<TranscriptInput bind:value={transcript} readonly={listening || creating} />
	</section>
</main>
