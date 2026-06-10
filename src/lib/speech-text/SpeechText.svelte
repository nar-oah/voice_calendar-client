<script lang="ts">
	import { onMount } from 'svelte';
	import { getEvent } from '$lib/api/event';
	import { createSpeechBridge, type SpeechBridge } from '$lib/bridge/speech';
	import { getEmptyEvent, type ScheduleEvent } from '$lib/speech-text/eventDefaults';
	import SpeechControls from '$lib/speech-text/SpeechControls.svelte';
	import SpeechHeader from '$lib/speech-text/SpeechHeader.svelte';
	import TranscriptInput from '$lib/speech-text/TranscriptInput.svelte';

	let {
		token,
		onEventRecognized
	}: { token: string; onEventRecognized?: (data: ScheduleEvent) => void } = $props();
	let supported = $state(false);
	let listening = $state(false);
	let transcript = $state('');
	let status = $state('正在检测浏览器支持...');
	let creating = $state(false);
	let recognition: SpeechBridge | null = null;
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
		const data = await getEvent(token, text);
		if (data != undefined) {
			onEventRecognized?.(data);
			status = '识别已结束';
		} else {
			status = '找不到您说的日程';
		}
	};

	const startRecognition = async () => {
		if (!recognition || listening || creating) return;
		createOnEnd = false;
		committedTranscript = transcript;
		listening = true;
		status = '正在聆听...';
		await recognition.start();
	};

	const stopRecognition = async () => {
		if (!recognition || !listening) return;
		createOnEnd = false;
		status = '正在停止...';
		await recognition.stop();
	};

	const toggleRecognition = () => {
		if (listening) {
			void stopRecognition();
		} else {
			void startRecognition();
		}
	};

	const createSchedule = async () => {
		if (creating) return;
		creating = true;

		if (recognition && listening) {
			createOnEnd = true;
			status = '正在整理识别内容...';
			await recognition.stop();
			return;
		}

		await submitSchedule();
		creating = false;
	};

	onMount(() => {
		let mounted = true;

		void createSpeechBridge({
			onStart: () => {
				listening = true;
				status = '正在聆听...';
			},
			onEnd: async () => {
				listening = false;
				committedTranscript = transcript;

				if (createOnEnd) {
					await submitSchedule();
					createOnEnd = false;
					creating = false;
					return;
				}

				status = transcript ? '识别已停止，可继续开始或新建日程。' : '等待开始。';
			},
			onError: (error) => {
				listening = false;
				creating = false;
				createOnEnd = false;
				status = `识别失败：${error}`;
			},
			onText: ({ finalText, interimText }) => {
				committedTranscript += finalText;
				transcript = `${committedTranscript}${interimText}`;
			}
		}).then((result) => {
			if (!mounted) {
				if (result.supported) void result.bridge.destroy();
				return;
			}

			if (!result.supported) {
				status = result.message;
				return;
			}

			recognition = result.bridge;
			supported = true;
			status = '点击开始后说话。';
		});

		return () => {
			mounted = false;
			void recognition?.destroy();
		};
	});
</script>

<main class="px-5 py-8 text-zinc-950">
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
