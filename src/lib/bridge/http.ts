import { isTauriRuntime } from './runtime';

export const bridgeFetch: typeof fetch = async (input, init) => {
	if (!isTauriRuntime()) return globalThis.fetch(input, init);

	const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
	return tauriFetch(input, init);
};
