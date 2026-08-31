const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getDateFromLocalKey(dateKey: string) {
  const match = DATE_KEY_PATTERN.exec(dateKey);

  if (!match) {
    throw new Error(`Invalid local date key: ${dateKey}`);
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), 12);
}

export function addCalendarDays(date: Date, amount: number) {
  const nextDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
  );
  nextDate.setDate(nextDate.getDate() + amount);
  return nextDate;
}

export function getStartOfWeek(date: Date) {
  return addCalendarDays(date, -date.getDay());
}

export function getWeekDates(date: Date) {
  const weekStart = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => addCalendarDays(weekStart, index));
}

export function formatFriendlyDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatMonthYear(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

function getUtcCalendarValue(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getRelativeDateLabel(dateKey: string, today = new Date()) {
  const date = getDateFromLocalKey(dateKey);
  const dayDifference = Math.round(
    (getUtcCalendarValue(today) - getUtcCalendarValue(date)) / 86_400_000,
  );

  if (dayDifference === 1) {
    return 'Yesterday';
  }

  if (dayDifference === 0) {
    return 'Today';
  }

  return formatFriendlyDate(date);
}

