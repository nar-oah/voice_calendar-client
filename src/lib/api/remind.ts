export async function addReminder(title: string, value: string): Promise<void> {
	const delay = new Date(value).getTime() - Date.now();
	if (delay > 0) {
		if (!('Notification' in window)) {
			alert('当前浏览器不支持通知');
			return;
		}
		if (Notification.permission === 'default') {
			await Notification.requestPermission();
		}
		if (Notification.permission !== 'granted') {
			alert('你没有允许浏览器通知');
			return;
		}
		setTimeout(() => {
			new Notification(title);
		}, delay);
	}
}
