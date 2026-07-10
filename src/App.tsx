import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Cake,
  Briefcase,
  Heart,
  Star,
  Trash2,
  Clock,
  Info,
  ChevronUp,
  ChevronDown,
  BarChart3,
  Settings as SettingsIcon,
  X,
  RefreshCw,
} from 'lucide-react';

import { CalendarEvent, CalendarView, ThemeType } from './types';
import {
  getJapaneseEra,
  JAPANESE_MONTHS,
  JAPANESE_WEEKDAYS,
  ENGLISH_WEEKDAYS,
  pad,
  toDateString,
  getWeekdayName,
  MONTH_NAMES,
  getMonthDays,
  getDefaultEvents,
  CalendarDay,
} from './utils';

import EventModal from './components/EventModal';
import BirthdayCelebration from './components/BirthdayCelebration';

export default function App() {
  // --- States ---
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    // July 6, 2026 is the current context
    return new Date(2026, 6, 6);
  });
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(2026, 6, 6));
  const [view, setView] = useState<CalendarView>('month');
  const [theme, setTheme] = useState<ThemeType>('aqua');
  const [modalOpen, setModalOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showJapaneseDays, setShowJapaneseDays] = useState(true);
  const [birthdayCelebration, setBirthdayCelebration] = useState<{ isOpen: boolean; name: string }>({
    isOpen: false,
    name: '',
  });

  // Load events from LocalStorage or fall back to defaults
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('aqua_calendar_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing events from localStorage', e);
      }
    }
    return getDefaultEvents();
  });

  // Save events to LocalStorage on change
  useEffect(() => {
    localStorage.setItem('aqua_calendar_events', JSON.stringify(events));
  }, [events]);

  // --- Dynamic calculations ---
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const selectedDateStr = useMemo(() => toDateString(selectedDate), [selectedDate]);

  // Generate 42 grid cells for Month View
  const monthDays = useMemo(() => {
    return getMonthDays(currentYear, currentMonth, events);
  }, [currentYear, currentMonth, events]);

  // Get events for the currently selected date
  const selectedDayEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDateStr);
  }, [events, selectedDateStr]);

  // Chinese/Japanese Zodiac Animal dynamic computation
  const getZodiacAnimal = (year: number): string => {
    const animals = ['Rat 🐀', 'Ox 🐂', 'Tiger 🐅', 'Rabbit 🐇', 'Dragon 🐉', 'Snake 🐍', 'Horse 🐎', 'Goat 🐐', 'Monkey 🐒', 'Rooster 🐓', 'Dog 🐕', 'Pig 🐖'];
    const index = (year - 4) % 12;
    return animals[index >= 0 ? index : index + 12];
  };

  // Scroll Container Ref for Horizontal Day Scroll View
  const dayScrollerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected day into view in Day Scroll view
  useEffect(() => {
    if (view === 'day' && dayScrollerRef.current) {
      const activeEl = dayScrollerRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }
  }, [selectedDate, view]);

  // --- Navigation Handlers ---
  const handleNext = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (view === 'day') {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(selectedDate.getDate() + 1);
      setSelectedDate(nextDay);
      if (nextDay.getMonth() !== currentMonth || nextDay.getFullYear() !== currentYear) {
        setCurrentDate(new Date(nextDay.getFullYear(), nextDay.getMonth(), 1));
      }
    } else if (view === 'week') {
      const nextWeek = new Date(selectedDate);
      nextWeek.setDate(selectedDate.getDate() + 7);
      setSelectedDate(nextWeek);
      if (nextWeek.getMonth() !== currentMonth || nextWeek.getFullYear() !== currentYear) {
        setCurrentDate(new Date(nextWeek.getFullYear(), nextWeek.getMonth(), 1));
      }
    } else if (view === 'year') {
      setCurrentDate(new Date(currentYear + 1, currentMonth, 1));
    }
  };

  const handlePrev = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (view === 'day') {
      const prevDay = new Date(selectedDate);
      prevDay.setDate(selectedDate.getDate() - 1);
      setSelectedDate(prevDay);
      if (prevDay.getMonth() !== currentMonth || prevDay.getFullYear() !== currentYear) {
        setCurrentDate(new Date(prevDay.getFullYear(), prevDay.getMonth(), 1));
      }
    } else if (view === 'week') {
      const prevWeek = new Date(selectedDate);
      prevWeek.setDate(selectedDate.getDate() - 7);
      setSelectedDate(prevWeek);
      if (prevWeek.getMonth() !== currentMonth || prevWeek.getFullYear() !== currentYear) {
        setCurrentDate(new Date(prevWeek.getFullYear(), prevWeek.getMonth(), 1));
      }
    } else if (view === 'year') {
      setCurrentDate(new Date(currentYear - 1, currentMonth, 1));
    }
  };

  const handleSelectToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // --- Event Manipulation ---
  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setEvents((prev) => [...prev, newEvent]);

    // Celebrate instantly if it's a birthday!
    if (newEvent.type === 'birthday') {
      setBirthdayCelebration({
        isOpen: true,
        name: newEvent.title.replace(/🎉|🎂/g, '').trim(),
      });
    }
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents((prev) => prev.filter((item) => item.id !== id));
  };

  const triggerBirthdayAnimation = (title: string) => {
    const cleanName = title.replace(/🎉|🎂/g, '').trim();
    setBirthdayCelebration({
      isOpen: true,
      name: cleanName,
    });
  };

  const resetToDefaultEvents = () => {
    if (window.confirm('Do you want to restore the default holiday and birthday list? Your current list will be overwritten.')) {
      setEvents(getDefaultEvents());
      setSettingsOpen(false);
    }
  };

  // --- Theme Configurations ---
  const themeConfig = {
    aqua: {
      textAccent: 'text-cyan-500',
      textAccentMuted: 'text-cyan-400',
      bgAccent: 'bg-cyan-500',
      bgAccentHover: 'hover:bg-cyan-600',
      ringAccent: 'focus:ring-cyan-500/20',
      activeDayCircle: 'bg-cyan-500 text-white shadow-inner',
      todayIndicator: 'border-cyan-500 text-cyan-600 font-bold bg-cyan-50/50',
      eventDot: 'bg-cyan-500',
      badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-100',
      borderAccent: 'border-cyan-100',
      textTitle: 'text-cyan-900',
      bgApp: 'bg-cyan-50/50',
      gridPattern: 'grid-pattern-cyan',
      textWatermark: 'text-cyan-200/30',
      navActiveBg: 'bg-cyan-50 text-cyan-600',
    },
    pink: {
      textAccent: 'text-pink-500',
      textAccentMuted: 'text-pink-400',
      bgAccent: 'bg-pink-500',
      bgAccentHover: 'hover:bg-pink-600',
      ringAccent: 'focus:ring-pink-500/20',
      activeDayCircle: 'bg-pink-500 text-white shadow-inner',
      todayIndicator: 'border-pink-500 text-pink-600 font-bold bg-pink-50/50',
      eventDot: 'bg-pink-500',
      badgeBg: 'bg-pink-50 text-pink-700 border-pink-100',
      borderAccent: 'border-pink-100',
      textTitle: 'text-pink-900',
      bgApp: 'bg-pink-50/40',
      gridPattern: 'grid-pattern-pink',
      textWatermark: 'text-pink-200/30',
      navActiveBg: 'bg-pink-50 text-pink-600',
    },
    purple: {
      textAccent: 'text-purple-500',
      textAccentMuted: 'text-purple-400',
      bgAccent: 'bg-purple-500',
      bgAccentHover: 'hover:bg-purple-600',
      ringAccent: 'focus:ring-purple-500/20',
      activeDayCircle: 'bg-purple-500 text-white shadow-inner',
      todayIndicator: 'border-purple-500 text-purple-600 font-bold bg-purple-50/50',
      eventDot: 'bg-purple-500',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-100',
      borderAccent: 'border-purple-100',
      textTitle: 'text-purple-900',
      bgApp: 'bg-purple-50/50',
      gridPattern: 'grid-pattern-purple',
      textWatermark: 'text-purple-200/30',
      navActiveBg: 'bg-purple-50 text-purple-600',
    },
    emerald: {
      textAccent: 'text-emerald-500',
      textAccentMuted: 'text-emerald-400',
      bgAccent: 'bg-emerald-500',
      bgAccentHover: 'hover:bg-emerald-600',
      ringAccent: 'focus:ring-emerald-500/20',
      activeDayCircle: 'bg-emerald-500 text-white shadow-inner',
      todayIndicator: 'border-emerald-500 text-emerald-600 font-bold bg-emerald-50/50',
      eventDot: 'bg-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      borderAccent: 'border-emerald-100',
      textTitle: 'text-emerald-900',
      bgApp: 'bg-emerald-50/50',
      gridPattern: 'grid-pattern-emerald',
      textWatermark: 'text-emerald-200/30',
      navActiveBg: 'bg-emerald-50 text-emerald-600',
    },
    amber: {
      textAccent: 'text-amber-500',
      textAccentMuted: 'text-amber-400',
      bgAccent: 'bg-amber-500',
      bgAccentHover: 'hover:bg-amber-600',
      ringAccent: 'focus:ring-amber-500/20',
      activeDayCircle: 'bg-amber-500 text-white shadow-inner',
      todayIndicator: 'border-amber-500 text-amber-600 font-bold bg-amber-50/50',
      eventDot: 'bg-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-100',
      borderAccent: 'border-amber-100',
      textTitle: 'text-amber-900',
      bgApp: 'bg-amber-50/50',
      gridPattern: 'grid-pattern-amber',
      textWatermark: 'text-amber-200/30',
      navActiveBg: 'bg-amber-50 text-amber-600',
    },
    dark: {
      textAccent: 'text-slate-300',
      textAccentMuted: 'text-slate-400',
      bgAccent: 'bg-slate-700',
      bgAccentHover: 'hover:bg-slate-600',
      ringAccent: 'focus:ring-slate-500/20',
      activeDayCircle: 'bg-slate-700 text-white shadow-inner',
      todayIndicator: 'border-slate-500 text-slate-300 font-bold bg-slate-800',
      eventDot: 'bg-slate-400',
      badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
      borderAccent: 'border-slate-800',
      textTitle: 'text-slate-100',
      bgApp: 'bg-slate-950',
      gridPattern: 'grid-pattern-dark',
      textWatermark: 'text-slate-800/40',
      navActiveBg: 'bg-slate-800 text-slate-100',
    },
  };

  const currentTheme = themeConfig[theme];

  // Kanji days converter
  const getKanjiDayNumber = (day: number): string => {
    if (day === 20) return '二十';
    if (day === 30) return '三十';
    const kanjiUnits = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
    if (day < 10) return kanjiUnits[day];
    if (day === 10) return '十';
    if (day < 20) return '十' + kanjiUnits[day - 10];
    if (day < 30) return '二十' + kanjiUnits[day - 20];
    return '三十' + kanjiUnits[day - 30];
  };

  // --- Analytical Computations for Sidebar Analytics ---
  const analyticsData = useMemo(() => {
    const total = events.length;
    const birthdays = events.filter(e => e.type === 'birthday').length;
    const work = events.filter(e => e.type === 'work').length;
    const personal = events.filter(e => e.type === 'personal').length;
    const important = events.filter(e => e.type === 'important').length;
    return { total, birthdays, work, personal, important };
  }, [events]);

  // --- View Renderers ---

  // 1. Month View Grid - matches the custom styled calendar in design
  const renderMonthView = () => {
    return (
      <div className="h-full flex flex-col justify-between">
        {/* Days of week header */}
        <div className="grid grid-cols-7 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-1">
          {ENGLISH_WEEKDAYS.map((en, idx) => (
            <div key={en} className="flex flex-col">
              <span>{en}</span>
              {showJapaneseDays && (
                <span className="text-[8px] opacity-75 leading-none mt-0.5">
                  {JAPANESE_WEEKDAYS[idx]}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className={`grid grid-cols-7 border-t border-l ${currentTheme.borderAccent} bg-white/45 backdrop-blur-xs flex-1 min-h-[380px]`}>
          {monthDays.map((day, idx) => {
            const isSelected = toDateString(day.date) === selectedDateStr;
            const hasEvents = day.events.length > 0;
            const dayEvents = day.events;

            return (
              <button
                key={`${day.dateString}-${idx}`}
                onClick={() => {
                  setSelectedDate(day.date);
                  if (day.date.getMonth() !== currentMonth) {
                    setCurrentDate(new Date(day.date.getFullYear(), day.date.getMonth(), 1));
                  }
                }}
                className={`p-2.5 border-r border-b ${currentTheme.borderAccent} text-left flex flex-col justify-between transition-all cursor-pointer outline-hidden group relative min-h-[75px] ${
                  day.isCurrentMonth ? (theme === 'dark' ? 'text-slate-100' : 'text-slate-800') : (theme === 'dark' ? 'text-slate-700' : 'text-slate-300')
                } ${
                  isSelected
                    ? (theme === 'dark' ? 'bg-slate-800/80' : 'bg-cyan-500/10') + ' ring-1 ring-inset ' + (theme === 'dark' ? 'ring-slate-700' : 'ring-cyan-200')
                    : 'hover:bg-white/60'
                }`}
              >
                {/* Day num layout */}
                <div className="flex items-start justify-between w-full">
                  <span className={`text-sm font-black tracking-tight ${
                    day.isToday
                      ? `inline-flex items-center justify-center w-6 h-6 rounded-md ${currentTheme.bgAccent} text-white font-extrabold`
                      : ''
                  }`}>
                    {pad(day.dayNum)}
                  </span>
                  {showJapaneseDays && (
                    <span className="text-[8px] font-bold text-slate-400/80 uppercase font-mono mt-0.5 select-none">
                      {getKanjiDayNumber(day.dayNum)}
                    </span>
                  )}
                </div>

                {/* Event previews inside cell */}
                <div className="mt-1 w-full space-y-1 overflow-hidden">
                  {dayEvents.slice(0, 2).map((evt) => (
                    <div
                      key={evt.id}
                      className={`text-[8px] px-1 py-0.5 rounded-xs truncate font-bold flex items-center gap-0.5 ${
                        evt.type === 'birthday'
                          ? 'bg-amber-100 text-amber-800 border-l-2 border-amber-500'
                          : evt.type === 'work'
                          ? 'bg-sky-100 text-sky-800 border-l-2 border-sky-500'
                          : evt.type === 'important'
                          ? 'bg-purple-100 text-purple-800 border-l-2 border-purple-500'
                          : 'bg-rose-100 text-rose-800 border-l-2 border-rose-500'
                      }`}
                    >
                      <span className="shrink-0">{evt.type === 'birthday' ? '🎂' : '•'}</span>
                      <span className="truncate">{evt.title}</span>
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[7px] font-black text-slate-400 pl-1">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 2. Day Scroll View (Horizontal timeline layout)
  const renderDayScrollView = () => {
    const daysInMonth: Date[] = [];
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let d = 1; d <= totalDays; d++) {
      daysInMonth.push(new Date(currentYear, currentMonth, d));
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Horizontal Day Timeline
          </span>
          <span className="text-xs font-bold text-slate-500 font-mono">
            {totalDays} Days in {MONTH_NAMES[currentMonth].toUpperCase()}
          </span>
        </div>

        {/* Horizontal Slider */}
        <div
          ref={dayScrollerRef}
          className="flex gap-2.5 overflow-x-auto pb-4 pt-1 scrollbar-none scroll-smooth"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {daysInMonth.map((d) => {
            const dateStr = toDateString(d);
            const isSelected = dateStr === selectedDateStr;
            const dayNum = d.getDate();
            const weekdayIdx = d.getDay();
            const dayEvents = events.filter((e) => e.date === dateStr);
            const hasEvents = dayEvents.length > 0;
            const isBirthday = dayEvents.some((e) => e.type === 'birthday');

            return (
              <button
                key={dateStr}
                data-active={isSelected}
                onClick={() => setSelectedDate(d)}
                style={{ scrollSnapAlign: 'center' }}
                className={`flex-none flex flex-col items-center justify-center w-16 h-24 rounded-2xl transition-all border outline-hidden cursor-pointer ${
                  isSelected
                    ? `${currentTheme.bgAccent} border-transparent text-white shadow-xl shadow-cyan-500/20 scale-105`
                    : (theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700')
                }`}
              >
                <span className={`text-[10px] uppercase font-black tracking-wider leading-none ${
                  isSelected ? 'text-white' : 'text-slate-400'
                }`}>
                  {ENGLISH_WEEKDAYS[weekdayIdx]}
                </span>
                <span className={`text-[8px] mt-1 ${isSelected ? 'text-white/60' : 'text-slate-400/80'}`}>
                  {JAPANESE_WEEKDAYS[weekdayIdx]}
                </span>
                <span className="text-xl font-black mt-2 leading-none">{pad(dayNum)}</span>

                {hasEvents && (
                  <div className="mt-2.5">
                    {isBirthday ? (
                      <span className="text-[10px]">🎂</span>
                    ) : (
                      <span className={`h-1.5 w-1.5 rounded-full inline-block ${
                        isSelected ? 'bg-white' : currentTheme.eventDot
                      }`} />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className={`rounded-2xl p-4 border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'} flex items-start gap-3`}>
          <Info className={`w-4 h-4 mt-0.5 shrink-0 ${currentTheme.textAccent}`} />
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-200">Timeline Guidance</h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Scroll horizontally with trackpad or grab & slide to view days. Click any date card to instantly lock selection. Use UP and DOWN keyboard navigation inside the sidebars to jump days.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // 3. Week View Rows
  const renderWeekView = () => {
    const currentWeekDays: Date[] = [];
    const selectedDayOfWeek = selectedDate.getDay();
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      currentWeekDays.push(d);
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Weekly Agenda Row Layout
          </span>
          <span className="text-xs font-bold text-slate-500 font-mono">
            Wk of {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {currentWeekDays.map((d) => {
            const dateStr = toDateString(d);
            const isSelected = dateStr === selectedDateStr;
            const isToday = toDateString(new Date()) === dateStr;
            const weekdayIdx = d.getDay();
            const dayEvents = events.filter((e) => e.date === dateStr);

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDate(d)}
                className={`flex items-start gap-4 p-3.5 rounded-2xl transition-all border cursor-pointer ${
                  isSelected
                    ? (theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200') + ' border-l-4 border-l-cyan-500'
                    : 'bg-white border-slate-100 hover:bg-slate-50/50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                  isToday
                    ? `${currentTheme.bgAccent} text-white`
                    : (theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700')
                }`}>
                  <span className="text-sm font-black leading-none">{pad(d.getDate())}</span>
                  <span className="text-[8px] mt-1 leading-none uppercase font-black tracking-wider opacity-80">
                    {ENGLISH_WEEKDAYS[weekdayIdx]}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                      {getWeekdayName(d, 'en')} {showJapaneseDays && `• ${getWeekdayName(d, 'ja')}`}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${currentTheme.badgeBg}`}>
                        {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {dayEvents.length === 0 ? (
                      <span className="text-[11px] text-slate-400 italic">No scheduled events</span>
                    ) : (
                      dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-sans truncate"
                        >
                          {evt.type === 'birthday' ? (
                            <Cake className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ) : evt.type === 'work' ? (
                            <Briefcase className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          ) : evt.type === 'important' ? (
                            <Star className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                          ) : (
                            <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                          {evt.time && <span className="font-mono text-[10px] text-slate-400">{evt.time}</span>}
                          <span className="truncate font-medium">{evt.title}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 4. Year View (Grid of Months Overviews)
  const renderYearView = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {currentYear} year calendar overview
          </span>
          <span className="text-xs font-bold text-slate-500">
            Click month to quick navigate
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1 py-1">
          {MONTH_NAMES.map((mName, mIdx) => {
            const isCurrentActiveMonth = currentMonth === mIdx;
            const monthEventsCount = events.filter((e) => {
              const eDate = new Date(e.date);
              return eDate.getFullYear() === currentYear && eDate.getMonth() === mIdx;
            }).length;

            return (
              <button
                key={mName}
                onClick={() => {
                  setCurrentDate(new Date(currentYear, mIdx, 1));
                  setSelectedDate(new Date(currentYear, mIdx, 1));
                  setView('month');
                }}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer outline-hidden hover:scale-[1.03] ${
                  isCurrentActiveMonth
                    ? `bg-slate-50/50 ${currentTheme.borderAccent} shadow-xs`
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/30'
                }`}
              >
                <div className="leading-tight">
                  <h4 className={`text-xs font-black uppercase tracking-wider ${
                    isCurrentActiveMonth ? currentTheme.textAccent : 'text-slate-800'
                  }`}>
                    {mName.substring(0, 3)}
                  </h4>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {JAPANESE_MONTHS[mIdx + 1]?.standard} {showJapaneseDays && `(${JAPANESE_MONTHS[mIdx + 1]?.traditional})`}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[9px] font-black text-slate-300 uppercase">Agenda</span>
                  {monthEventsCount > 0 ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${currentTheme.badgeBg}`}>
                      {monthEventsCount}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-300">—</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-slate-100 ${theme === 'dark' ? 'dark bg-slate-950' : ''} flex flex-col items-center justify-center py-6 px-4 select-none transition-colors duration-500`}>
      
      {/* Container simulating a premium high-fidelity desktop/tablet dashboard framework matching the Bold Typography spec */}
      <div className={`w-full max-w-5xl h-[750px] bg-white dark:bg-slate-950 flex overflow-hidden font-sans ${theme === 'dark' ? 'text-slate-100 border-slate-800' : 'text-slate-800 border-white'} border-8 rounded-[36px] shadow-3xl relative transition-all`}>
        
        {/* --- LEFT SIDEBAR NAVIGATION --- */}
        <nav className={`w-24 bg-white dark:bg-slate-900 border-r ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'} flex flex-col items-center py-6 justify-between shrink-0`}>
          {/* Theme colored logo indicator */}
          <button
            onClick={handleSelectToday}
            className={`text-3xl font-black transition-all cursor-pointer hover:scale-110 active:scale-95 ${currentTheme.textAccent}`}
            title="Go to Today"
          >
            ●
          </button>

          {/* Tactile Quick Theme Switcher */}
          <div className="flex flex-col gap-2.5 py-4 my-2 border-y border-slate-100 dark:border-slate-800 w-full items-center">
            <span className="text-[7px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-1">Theme</span>
            {(['aqua', 'pink', 'purple', 'emerald', 'amber', 'dark'] as ThemeType[]).map((t) => {
              const bgClass = 
                t === 'aqua' ? 'bg-cyan-500' :
                t === 'pink' ? 'bg-pink-500' :
                t === 'purple' ? 'bg-purple-500' :
                t === 'emerald' ? 'bg-emerald-500' :
                t === 'amber' ? 'bg-amber-500' : 'bg-slate-700';
              const titleName = 
                t === 'aqua' ? 'Aqua' :
                t === 'pink' ? 'Sakura' :
                t === 'purple' ? 'Amethyst' :
                t === 'emerald' ? 'Emerald' :
                t === 'amber' ? 'Amber' : 'Obsidian';
              return (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`w-4.5 h-4.5 rounded-full ${bgClass} cursor-pointer transition-all hover:scale-125 hover:shadow-xs relative group ${
                    theme === t ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={`Switch to ${titleName}`}
                >
                  {/* Tooltip on hover */}
                  <span className="absolute left-7 top-1/2 -translate-y-1/2 bg-slate-950 text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-md">
                    {titleName}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Vertical Navigation Links */}
          <div className="flex flex-col gap-8 items-center">
            <button
              onClick={() => {
                setView('month');
                setAnalyticsOpen(false);
                setSettingsOpen(false);
              }}
              className={`writing-vertical text-xs font-black tracking-[0.2em] uppercase transition-all cursor-pointer hover:opacity-100 ${
                !analyticsOpen && !settingsOpen ? currentTheme.textAccent + ' opacity-100' : 'text-slate-400 opacity-40'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => {
                setAnalyticsOpen(true);
                setSettingsOpen(false);
              }}
              className={`writing-vertical text-xs font-black tracking-[0.2em] uppercase transition-all cursor-pointer hover:opacity-100 flex items-center gap-1 ${
                analyticsOpen ? currentTheme.textAccent + ' opacity-100' : 'text-slate-400 opacity-40'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 rotate-90" />
              <span>Analytics</span>
            </button>
            <button
              onClick={() => {
                setSettingsOpen(true);
                setAnalyticsOpen(false);
              }}
              className={`writing-vertical text-xs font-black tracking-[0.2em] uppercase transition-all cursor-pointer hover:opacity-100 flex items-center gap-1 ${
                settingsOpen ? currentTheme.textAccent + ' opacity-100' : 'text-slate-400 opacity-40'
              }`}
            >
              <SettingsIcon className="w-3.5 h-3.5 rotate-90 animate-spin-slow" />
              <span>Settings</span>
            </button>
          </div>

          {/* Initials badge displaying current user initials or default */}
          <div
            onClick={() => setSettingsOpen(prev => !prev)}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-black text-xs cursor-pointer shadow-md shadow-cyan-500/10 active:scale-95 transition-all ${currentTheme.bgAccent}`}
            title="Aesthetic user details"
          >
            AC
          </div>
        </nav>

        {/* --- MAIN CALENDAR WORKSPACE AREA --- */}
        <main className={`flex-1 flex flex-col relative px-10 py-8 ${currentTheme.gridPattern} transition-all overflow-y-auto`}>
          
          <AnimatePresence mode="wait">
            {!analyticsOpen && !settingsOpen ? (
              <motion.div
                key="workspace-calendar"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* Dynamic Watermarked Header */}
                <header className="flex justify-between items-end mb-6 shrink-0 relative">
                  <div className="relative">
                    {/* The iconic massive absolute background month watermark matching the design */}
                    <div className={`absolute -top-12 -left-6 ${currentTheme.textWatermark} text-[10rem] font-black select-none opacity-60 z-0 tracking-tighter leading-none`}>
                      {pad(currentMonth + 1)}
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter leading-none relative z-10 uppercase select-all">
                      {MONTH_NAMES[currentMonth]}
                      <span className={`${currentTheme.textAccent}`}>.</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-60 flex items-center gap-1">
                      <span>{getJapaneseEra(currentYear)}</span>
                      <span>•</span>
                      <span>{getZodiacAnimal(currentYear)}</span>
                      <span>•</span>
                      <span>{currentYear}</span>
                    </p>
                  </div>

                  {/* Top Navigation Row / Segmented tabs */}
                  <div className="flex flex-col items-end gap-3 pb-1 z-10">
                    {/* Navigation Arrows Cycle Stack */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handlePrev}
                        className={`p-2 rounded-full border ${theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'} transition-all cursor-pointer shadow-xs active:scale-90`}
                        title="Previous"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleSelectToday}
                        className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'} transition-all cursor-pointer shadow-xs active:scale-95`}
                      >
                        Today • 今
                      </button>
                      <button
                        onClick={handleNext}
                        className={`p-2 rounded-full border ${theme === 'dark' ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'} transition-all cursor-pointer shadow-xs active:scale-90`}
                        title="Next"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* View selectors */}
                    <div className={`flex bg-white dark:bg-slate-900 rounded-full p-1 border ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'} shadow-sm`}>
                      {(['month', 'week', 'day', 'year'] as CalendarView[]).map((v) => {
                        const isActive = view === v;
                        return (
                          <button
                            key={v}
                            onClick={() => setView(v)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              isActive
                                ? `${currentTheme.bgAccent} text-white shadow-md shadow-cyan-500/10`
                                : `text-slate-400 hover:text-slate-600`
                            }`}
                          >
                            {v}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </header>

                {/* Main Rendered View Body */}
                <div className="flex-1 min-h-0">
                  {view === 'month' && renderMonthView()}
                  {view === 'day' && renderDayScrollView()}
                  {view === 'week' && renderWeekView()}
                  {view === 'year' && renderYearView()}
                </div>
              </motion.div>
            ) : analyticsOpen ? (
              // --- Side Panel: ANALYTICS BOARD ---
              <motion.div
                key="workspace-analytics"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                      Analytics Board<span className={currentTheme.textAccent}>.</span>
                    </h2>
                    <button
                      onClick={() => setAnalyticsOpen(false)}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
                    Breakdown of currently logged events and milestones
                  </p>

                  {/* Stat cards bento-grid */}
                  <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <span className="text-xs font-black uppercase text-slate-400">Total Logged</span>
                      <h3 className="text-4xl font-black mt-2 text-slate-800 dark:text-slate-100">{analyticsData.total}</h3>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-100/50">
                      <span className="text-xs font-black uppercase text-amber-600">Birthdays 🎂</span>
                      <h3 className="text-4xl font-black mt-2 text-amber-700">{analyticsData.birthdays}</h3>
                    </div>
                    <div className="bg-sky-50 dark:bg-sky-950/20 p-5 rounded-2xl border border-sky-100/50">
                      <span className="text-xs font-black uppercase text-sky-600">Work Syncs 💼</span>
                      <h3 className="text-4xl font-black mt-2 text-sky-700">{analyticsData.work}</h3>
                    </div>
                    <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-100/50">
                      <span className="text-xs font-black uppercase text-rose-600">Personal 💖</span>
                      <h3 className="text-4xl font-black mt-2 text-rose-700">{analyticsData.personal}</h3>
                    </div>
                  </div>

                  {/* Interactive stats list summary */}
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-wider text-slate-600">Productivity Index</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Your calendar is mostly composed of <span className="font-bold text-cyan-600">birthdays and essential family events</span>. To add more items, navigate to any date card on the calendar screen and click the "+ Event" button in the action panel or press the big button in the bottom-right sidebar.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setAnalyticsOpen(false)}
                  className={`py-4 w-full text-center text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-colors cursor-pointer ${currentTheme.bgAccent} ${currentTheme.bgAccentHover}`}
                >
                  Return to Calendar View
                </button>
              </motion.div>
            ) : (
              // --- Side Panel: SETTINGS PANEL ---
              <motion.div
                key="workspace-settings"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b pb-4 mb-6">
                    <h2 className="text-3xl font-black uppercase tracking-tighter">
                      Preferences<span className={currentTheme.textAccent}>.</span>
                    </h2>
                    <button
                      onClick={() => setSettingsOpen(false)}
                      className="p-2 rounded-full hover:bg-slate-100 text-slate-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
                    Configure look, theme colors, and traditional translations
                  </p>

                  <div className="space-y-6">
                    {/* Theme switcher option */}
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400">Color Palette</label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setTheme('aqua')}
                          className={`p-4 rounded-xl border text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            theme === 'aqua' ? 'bg-cyan-50 border-cyan-300 text-cyan-700 font-extrabold shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-cyan-500 block shrink-0" />
                          Aqua
                        </button>
                        <button
                          onClick={() => setTheme('pink')}
                          className={`p-4 rounded-xl border text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            theme === 'pink' ? 'bg-pink-50 border-pink-300 text-pink-700 font-extrabold shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-pink-500 block shrink-0" />
                          Sakura
                        </button>
                        <button
                          onClick={() => setTheme('purple')}
                          className={`p-4 rounded-xl border text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            theme === 'purple' ? 'bg-purple-50 border-purple-300 text-purple-700 font-extrabold shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-purple-500 block shrink-0" />
                          Amethyst
                        </button>
                        <button
                          onClick={() => setTheme('emerald')}
                          className={`p-4 rounded-xl border text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            theme === 'emerald' ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-extrabold shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-emerald-500 block shrink-0" />
                          Emerald
                        </button>
                        <button
                          onClick={() => setTheme('amber')}
                          className={`p-4 rounded-xl border text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            theme === 'amber' ? 'bg-amber-50 border-amber-300 text-amber-700 font-extrabold shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-amber-500 block shrink-0" />
                          Amber
                        </button>
                        <button
                          onClick={() => setTheme('dark')}
                          className={`p-4 rounded-xl border text-xs font-black uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${
                            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white font-extrabold shadow-sm' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="w-3 h-3 rounded-full bg-slate-700 block shrink-0" />
                          Obsidian
                        </button>
                      </div>
                    </div>

                    {/* Kanji setting option */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Japanese Kanji Support</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Toggle display of traditional Kanji numeral days & Traditional Month Eras</p>
                      </div>
                      <button
                        onClick={() => setShowJapaneseDays(prev => !prev)}
                        className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          showJapaneseDays ? 'bg-cyan-500 text-white' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {showJapaneseDays ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>

                    {/* Reset button option */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Restore Factory Presets</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Clears custom events and overwrites with premium template items</p>
                      </div>
                      <button
                        onClick={resetToDefaultEvents}
                        className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 hover:bg-rose-200 text-rose-600 border border-rose-200 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Reset
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSettingsOpen(false)}
                  className={`py-4 w-full text-center text-white font-black uppercase text-xs tracking-widest rounded-2xl transition-colors cursor-pointer ${currentTheme.bgAccent} ${currentTheme.bgAccentHover}`}
                >
                  Save and Apply Changes
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* --- RIGHT ACTION SIDEBAR --- */}
        <aside className={`w-80 bg-white dark:bg-slate-900 border-l ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'} flex flex-col justify-between shrink-0`}>
          {/* Header title */}
          <div className="p-8 flex-1 flex flex-col justify-between overflow-y-auto">
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-500 mb-6">
                Upcoming Agenda ({selectedDayEvents.length})
              </h2>

              {/* Day details */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Selected Agenda Date</span>
                <h3 className={`text-sm font-black mt-1 ${currentTheme.textAccent}`}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                {showJapaneseDays && (
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日 ({getWeekdayName(selectedDate, 'ja')})
                  </p>
                )}
              </div>

              {/* Event scroll container list */}
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-1">
                {selectedDayEvents.length === 0 ? (
                  <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                    <span className="text-xs text-slate-400 font-medium block">No logged events</span>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="text-[10px] font-black uppercase tracking-wider text-cyan-500 mt-2 hover:underline cursor-pointer"
                    >
                      + Add Event
                    </button>
                  </div>
                ) : (
                  selectedDayEvents.map((evt) => (
                    // Elegant list item layout with big background day watermark
                    <div
                      key={evt.id}
                      onClick={() => evt.type === 'birthday' && triggerBirthdayAnimation(evt.title)}
                      className="relative group transition-transform cursor-pointer hover:scale-[1.02] border-b border-slate-50 dark:border-slate-800 pb-4"
                    >
                      {/* Background Watermark number */}
                      <span className="text-5xl font-black absolute -top-4 -left-1 opacity-5 text-slate-900 dark:text-white select-none pointer-events-none z-0">
                        {pad(new Date(evt.date).getDate())}
                      </span>
                      
                      <div className="relative z-10 pl-1 flex items-start justify-between">
                        <div className="min-w-0 pr-2">
                          <div className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${currentTheme.textAccent}`}>
                            {evt.time ? `${evt.time} • ` : ''} {evt.type.toUpperCase()}
                          </div>
                          <h4 className="text-sm font-black leading-tight text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                            {evt.type === 'birthday' ? '🎂' : ''} {evt.title}
                          </h4>
                          {evt.description && (
                            <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[180px]">
                              {evt.description}
                            </p>
                          )}
                        </div>

                        {/* Delete trigger */}
                        <button
                          onClick={(e) => handleDeleteEvent(evt.id, e)}
                          className="p-1 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shrink-0 outline-hidden"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today Switcher in Side margin */}
            <div className="pt-6 border-t border-slate-50 dark:border-slate-800">
              <button
                onClick={handleSelectToday}
                className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-center font-black text-[10px] uppercase tracking-widest cursor-pointer hover:bg-slate-50/50"
              >
                Focus Calendar on Today
              </button>
            </div>
          </div>

          {/* Core themed action button at the bottom */}
          <div className="p-8 pt-0">
            <button
              onClick={() => setModalOpen(true)}
              className={`w-full py-4 bg-slate-900 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${currentTheme.bgAccent} ${currentTheme.bgAccentHover} hover:shadow-cyan-500/10 active:scale-98`}
            >
              <span className="text-base font-bold">+</span> Add New Event
            </button>
          </div>
        </aside>

      </div>

      {/* Action form modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleAddEvent}
        selectedDate={selectedDateStr}
      />

      {/* Confetti / balloon generator overlay */}
      <BirthdayCelebration
        name={birthdayCelebration.name}
        isOpen={birthdayCelebration.isOpen}
        onClose={() => setBirthdayCelebration({ isOpen: false, name: '' })}
      />
    </div>
  );
}
