import { isTauriRuntime } from './runtime';

export const bridgeFetch = async (input: Request): Promise<Response> => {
	if (!isTauriRuntime()) return globalThis.fetch(input);

	const { fetch } = await import('@tauri-apps/plugin-http');
	return fetch(input);
};
