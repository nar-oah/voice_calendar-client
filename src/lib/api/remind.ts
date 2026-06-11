import { scheduleLocalNotification } from '$lib/bridge/notification';

export async function addReminder(title: string, value: string): Promise<void> {
	const result = await scheduleLocalNotification(title, new Date(value));
	if (result === 'unsupported') alert('当前运行环境不支持通知');
	if (result === 'denied') alert('你没有允许通知');
}
