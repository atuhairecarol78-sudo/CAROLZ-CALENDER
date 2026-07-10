export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  type: 'birthday' | 'work' | 'personal' | 'important';
  time?: string; // HH:MM format
}

export type CalendarView = 'day' | 'week' | 'month' | 'year';

export type ThemeType = 'aqua' | 'pink' | 'dark' | 'purple' | 'emerald' | 'amber';
