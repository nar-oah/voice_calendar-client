export type CalendarEventModalContext = {
	close: () => void;
	deleteEvent: (id: number) => void;
};

export const calendarEventModalContextKey = Symbol('calendar-event-modal');
