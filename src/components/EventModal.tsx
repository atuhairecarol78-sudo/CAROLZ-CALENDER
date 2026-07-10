import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Cake, Briefcase, Heart, Star } from 'lucide-react';
import { CalendarEvent } from '../types';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  selectedDate: string; // YYYY-MM-DD
}

export default function EventModal({ isOpen, onClose, onSave, selectedDate }: EventModalProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('birthday');
  const [time, setTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(selectedDate);

  // Sync date selection when selectedDate prop changes and modal opens
  React.useEffect(() => {
    if (isOpen) {
      setDate(selectedDate);
      setTitle('');
      setDescription('');
      setTime('09:00');
      setType('birthday');
    }
  }, [isOpen, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      type,
      date,
      time: time || undefined,
      description: description.trim() || undefined,
    });
    onClose();
  };

  const categories: { value: CalendarEvent['type']; label: string; icon: React.ReactNode; color: string }[] = [
    { value: 'birthday', label: 'Birthday', icon: <Cake className="w-4 h-4" />, color: 'bg-amber-100 text-amber-600 border-amber-200' },
    { value: 'work', label: 'Work', icon: <Briefcase className="w-4 h-4" />, color: 'bg-sky-100 text-sky-600 border-sky-200' },
    { value: 'personal', label: 'Personal', icon: <Heart className="w-4 h-4" />, color: 'bg-rose-100 text-rose-600 border-rose-200' },
    { value: 'important', label: 'Important', icon: <Star className="w-4 h-4" />, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 15, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="font-sans text-lg font-semibold text-slate-800 flex items-center gap-2">
                <span className="p-1.5 bg-cyan-50 rounded-lg text-cyan-600">
                  <Calendar className="w-5 h-5" />
                </span>
                Add New Event
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grandma's Birthday, Team sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700 placeholder:text-slate-400 transition-all text-sm font-sans"
                />
              </div>

              {/* Event Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setType(cat.value)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                        type === cat.value
                          ? `${cat.color} ring-2 ring-offset-1 ring-cyan-500/30 scale-[1.02] shadow-xs`
                          : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Date Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700 text-xs font-sans transition-all"
                  />
                </div>

                {/* Time Input */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700 text-xs font-sans transition-all"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Notes / Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Add additional details or reminders..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 text-slate-700 placeholder:text-slate-400 text-xs font-sans transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-slate-500 font-sans font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-cyan-500 hover:bg-cyan-600 text-white font-sans font-medium text-sm rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer active:scale-98"
                >
                  Create Event
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
