import { CalendarEvent } from './types';

// Dynamic calculation of Japanese Eras (Reiwa)
export function getJapaneseEra(year: number): string {
  if (year >= 2019) {
    const rYear = year - 2018;
    return `令和${rYear === 1 ? '元' : rYear}年`;
  }
  if (year >= 1989) {
    const hYear = year - 1988;
    return `平成${hYear === 1 ? '元' : hYear}年`;
  }
  return '';
}

// Japanese Month Names (Standard and Traditional)
export const JAPANESE_MONTHS: Record<number, { standard: string; traditional: string }> = {
  1: { standard: '一月', traditional: '睦月' },
  2: { standard: '二月', traditional: '如月' },
  3: { standard: '三月', traditional: '弥生' },
  4: { standard: '四月', traditional: '卯月' },
  5: { standard: '五月', traditional: '皐月' },
  6: { standard: '六月', traditional: '水無月' },
  7: { standard: '七月', traditional: '文月' },
  8: { standard: '八月', traditional: '葉月' },
  9: { standard: '九月', traditional: '長月' },
  10: { standard: '十月', traditional: '神無月' },
  11: { standard: '十一月', traditional: '霜月' },
  12: { standard: '十二月', traditional: '師走' },
};

// Japanese Weekday Characters
export const JAPANESE_WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
export const ENGLISH_WEEKDAYS = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];

// Helper to pad numbers (e.g., 5 -> "05")
export function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

// Convert Date object to date string "YYYY-MM-DD" in local time
export function toDateString(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Format weekday names
export function getWeekdayName(date: Date, lang: 'en' | 'ja' = 'en'): string {
  const day = date.getDay();
  if (lang === 'ja') {
    return `${JAPANESE_WEEKDAYS[day]}曜日`;
  }
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[day];
}

// Full english month names
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Generate days for 6-week month view (42 days total)
export interface CalendarDay {
  date: Date;
  dateString: string;
  dayNum: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

export function getMonthDays(year: number, month: number, events: CalendarEvent[]): CalendarDay[] {
  const firstDayOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
  
  // Create a copy of the date and wind back to the beginning of the week
  const startDate = new Date(year, month, 1);
  startDate.setDate(startDate.getDate() - startDayOfWeek);

  const todayStr = toDateString(new Date());
  const days: CalendarDay[] = [];

  // Always generate exactly 42 days (6 rows) to keep grid stable
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dateStr = toDateString(currentDate);
    const dayEvents = events.filter(e => e.date === dateStr);

    days.push({
      date: currentDate,
      dateString: dateStr,
      dayNum: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: dateStr === todayStr,
      events: dayEvents,
    });
  }

  return days;
}

// Get standard default events to pre-fill the calendar beautifully
export function getDefaultEvents(): CalendarEvent[] {
  const today = new Date();
  const yearStr = today.getFullYear();
  const monthStr = pad(today.getMonth() + 1);
  const dayStr = pad(today.getDate());
  
  const todayDateStr = `${yearStr}-${monthStr}-${dayStr}`;
  
  // Calculate a couple of dates around today
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = toDateString(tomorrow);

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 2);
  const yesterdayStr = toDateString(yesterday);

  return [
    {
      id: 'default-1',
      title: "Carol's Birthday 🎉",
      description: "Celebrate Carol's birthday with aqua-themed cake and custom animations!",
      date: todayDateStr,
      type: 'birthday',
      time: '09:00',
    },
    {
      id: 'default-2',
      title: 'Aqua Theme Presentation 🌊',
      description: 'Review the high-fidelity UI design matching the user screenshot.',
      date: todayDateStr,
      type: 'work',
      time: '14:00',
    },
    {
      id: 'default-3',
      title: 'Design Critique Session 🎨',
      description: 'Discuss Japanese translation aesthetics and theme variations.',
      date: tomorrowStr,
      type: 'work',
      time: '11:30',
    },
    {
      id: 'default-4',
      title: 'Important Health Checkup 🏥',
      description: 'Routine general clinical overview appointment.',
      date: yesterdayStr,
      type: 'important',
      time: '08:00',
    },
    {
      id: 'default-5',
      title: 'Family Dinner Night 🍽️',
      description: 'Meet at the classic sushi kitchen downtown.',
      date: tomorrowStr,
      type: 'personal',
      time: '19:00',
    },
    // Mockup-specific birthday (April 20, 2026) to match the photo
    {
      id: 'default-mockup-1',
      title: "Akher's Grand Birthday 🎂",
      description: 'The designer birthday shown in the mockup calendar!',
      date: '2026-04-20',
      type: 'birthday',
      time: '00:00',
    },
    {
      id: 'default-mockup-2',
      title: 'UI Design Launch 🚀',
      description: 'Release the premium aqua-pink calendar layout to the world.',
      date: '2026-04-20',
      type: 'important',
      time: '10:00',
    }
  ];
}
