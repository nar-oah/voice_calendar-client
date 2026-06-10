import { isTauriRuntime } from './runtime';

export type LocalNotificationResult = 'scheduled' | 'ignored' | 'unsupported' | 'denied';

const getBrowserPermission = async (): Promise<NotificationPermission | 'unsupported'> => {
	if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
	if (Notification.permission === 'default') return Notification.requestPermission();
	return Notification.permission;
};

const getTauriPermission = async (): Promise<NotificationPermission> => {
	const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
	if (await isPermissionGranted()) return 'granted';
	return requestPermission();
};

export const scheduleLocalNotification = async (
	title: string,
	date: Date
): Promise<LocalNotificationResult> => {
	if (date.getTime() <= Date.now()) return 'ignored';

	if (isTauriRuntime()) {
		const permission = await getTauriPermission();
		if (permission !== 'granted') return 'denied';

		const { Schedule, sendNotification } = await import('@tauri-apps/plugin-notification');
		sendNotification({ title, schedule: Schedule.at(date) });
		return 'scheduled';
	}

	const permission = await getBrowserPermission();
	if (permission === 'unsupported') return 'unsupported';
	if (permission !== 'granted') return 'denied';

	window.setTimeout(() => {
		new Notification(title);
	}, date.getTime() - Date.now());
	return 'scheduled';
};
