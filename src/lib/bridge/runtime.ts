import { isTauri } from '@tauri-apps/api/core';

export const isBrowserRuntime = (): boolean => typeof window !== 'undefined';

export const isTauriRuntime = (): boolean => isBrowserRuntime() && isTauri();
