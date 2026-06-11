import { isTauriRuntime } from './runtime';

export type SpeechTextChunk = {
	finalText: string;
	interimText: string;
};

export type SpeechBridgeEvents = {
	onStart: () => void;
	onEnd: () => void | Promise<void>;
	onError: (error: string) => void;
	onText: (chunk: SpeechTextChunk) => void;
};

export type SpeechBridge = {
	start: () => Promise<void>;
	stop: () => Promise<void>;
	abort: () => Promise<void>;
	destroy: () => Promise<void>;
};

export type SpeechBridgeResult =
	| { supported: true; bridge: SpeechBridge }
	| { supported: false; message: string };

type TauriListener = (() => void) | { unregister: () => Promise<void> };

const tauriSttUnavailableMessage = (reason?: string): string => {
	if (reason?.toLowerCase().includes('model')) {
		return 'Tauri STT 不可用：未安装 Whisper 模型。请先将 GGML 模型放入 appDataDir/whisper-models。';
	}

	return `Tauri STT 不可用${reason ? `：${reason}` : ''}`;
};

const removeTauriListener = async (listener: TauriListener): Promise<void> => {
	if (typeof listener === 'function') {
		listener();
		return;
	}

	await listener.unregister();
};

const createBrowserSpeechBridge = (events: SpeechBridgeEvents): SpeechBridgeResult => {
	const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
	if (!SpeechRecognitionConstructor) {
		return { supported: false, message: '当前浏览器不支持 SpeechRecognition。' };
	}

	const recognition = new SpeechRecognitionConstructor();
	recognition.lang = 'zh-CN';
	recognition.continuous = true;
	recognition.interimResults = true;

	recognition.onstart = events.onStart;
	recognition.onend = events.onEnd;
	recognition.onerror = (event) => events.onError(event.error);
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

		events.onText({ finalText, interimText });
	};

	return {
		supported: true,
		bridge: {
			start: async () => recognition.start(),
			stop: async () => recognition.stop(),
			abort: async () => recognition.abort(),
			destroy: async () => recognition.abort()
		}
	};
};

const createTauriSpeechBridge = async (events: SpeechBridgeEvents): Promise<SpeechBridgeResult> => {
	const {
		checkPermission,
		isAvailable,
		onError,
		onResult,
		onStateChange,
		requestPermission,
		startListening,
		stopListening
	} = await import('tauri-plugin-stt-api');
	const availability = await isAvailable();
	if (!availability.available) {
		return { supported: false, message: tauriSttUnavailableMessage(availability.reason) };
	}

	let listening = false;
	const startSession = () => {
		if (listening) return;
		listening = true;
		events.onStart();
	};
	const endSession = () => {
		if (!listening) return;
		listening = false;
		void events.onEnd();
	};
	const unlisteners: TauriListener[] = [
		await onResult((result) => {
			events.onText({
				finalText: result.isFinal ? result.transcript : '',
				interimText: result.isFinal ? '' : result.transcript
			});
		}),
		await onError((error) => {
			listening = false;
			events.onError(error.message || error.code);
		}),
		await onStateChange((event) => {
			if (event.state === 'listening') startSession();
			if (event.state === 'idle') endSession();
		})
	];

	const ensurePermission = async (): Promise<boolean> => {
		const current = await checkPermission();
		const next =
			current.microphone === 'unknown' || current.speechRecognition === 'unknown'
				? await requestPermission()
				: current;
		return next.microphone !== 'denied' && next.speechRecognition !== 'denied';
	};

	const stop = async () => {
		if (!listening) return;
		await stopListening();
		endSession();
	};

	return {
		supported: true,
		bridge: {
			start: async () => {
				if (!(await ensurePermission())) {
					events.onError('权限被拒绝');
					return;
				}
				await startListening({ language: 'zh-CN', maxDuration: 0 });
				startSession();
			},
			stop,
			abort: stop,
			destroy: async () => {
				await Promise.all(unlisteners.map(removeTauriListener));
				if (listening) await stopListening();
			}
		}
	};
};

export const createSpeechBridge = async (
	events: SpeechBridgeEvents
): Promise<SpeechBridgeResult> => {
	if (isTauriRuntime()) return createTauriSpeechBridge(events);
	return createBrowserSpeechBridge(events);
};
