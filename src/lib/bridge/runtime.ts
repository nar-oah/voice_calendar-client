export const isBrowserRuntime = (): boolean => typeof window !== 'undefined';

export const isTauriRuntime = (): boolean => {
	if (!isBrowserRuntime()) return false;

	const runtimeWindow = window as Window & {
		__TAURI__?: unknown;
		__TAURI_INTERNALS__?: unknown;
	};
	return Boolean(runtimeWindow.__TAURI__ || runtimeWindow.__TAURI_INTERNALS__);
};
