import { isTauriRuntime } from './runtime';

const storePath = 'voice-calendar.json';
let storePromise: Promise<import('@tauri-apps/plugin-store').LazyStore> | null = null;

const getTauriStore = async () => {
	storePromise ??= import('@tauri-apps/plugin-store').then(({ LazyStore }) => new LazyStore(storePath));
	return storePromise;
};

export const getStorageItem = async (key: string): Promise<string | undefined> => {
	if (isTauriRuntime()) {
		const value = await (await getTauriStore()).get<unknown>(key);
		return typeof value === 'string' ? value : undefined;
	}

	return typeof localStorage === 'undefined' ? undefined : (localStorage.getItem(key) ?? undefined);
};

export const setStorageItem = async (key: string, value: string): Promise<void> => {
	if (isTauriRuntime()) {
		const store = await getTauriStore();
		await store.set(key, value);
		await store.save();
		return;
	}

	if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
};
