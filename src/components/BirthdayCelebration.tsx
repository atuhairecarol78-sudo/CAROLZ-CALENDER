import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cake, Sparkles, X } from 'lucide-react';

interface BirthdayCelebrationProps {
  name: string;
  isOpen: boolean;
  onClose: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotate: number;
}

interface Balloon {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
}

const COLORS = [
  '#06b6d4', // cyan-500
  '#14b8a6', // teal-500
  '#22c55e', // green-500
  '#f43f5e', // rose-500
  '#e11d48', // rose-600
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#3b82f6', // blue-500
];

export default function BirthdayCelebration({ name, isOpen, onClose }: BirthdayCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Generate confetti particles
      const newParticles = Array.from({ length: 60 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100, // percentage width
        y: -10, // start above the screen
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        delay: Math.random() * 1.5,
        duration: Math.random() * 3 + 2,
        rotate: Math.random() * 360,
      }));

      // Generate balloons floating up
      const newBalloons = Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        x: Math.random() * 80 + 10, // percentage width
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 20 + 30, // px diameter
        delay: Math.random() * 1.2,
      }));

      setParticles(newParticles);
      setBalloons(newBalloons);

      // Auto close after 6 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs"
          />

          {/* Falling Confetti */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  top: '-5%',
                  left: `${p.x}%`,
                  rotate: p.rotate,
                  opacity: 1,
                }}
                animate={{
                  top: '105%',
                  rotate: p.rotate + 360,
                  opacity: [1, 1, 0.8, 0],
                  x: [0, Math.sin(p.id) * 30, Math.cos(p.id) * 40],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: 'linear',
                  repeat: 0,
                }}
                style={{
                  position: 'absolute',
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  backgroundColor: p.color,
                  borderRadius: p.id % 2 === 0 ? '50%' : '20%',
                }}
              />
            ))}
          </div>

          {/* Floating Balloons */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {balloons.map((b) => (
              <motion.div
                key={b.id}
                initial={{
                  bottom: '-15%',
                  left: `${b.x}%`,
                  opacity: 0.9,
                  scale: 1,
                }}
                animate={{
                  bottom: '115%',
                  opacity: [0.9, 0.9, 0.7, 0],
                  x: [0, Math.sin(b.id) * 40, -Math.sin(b.id) * 30],
                }}
                transition={{
                  duration: 6,
                  delay: b.delay,
                  ease: 'easeOut',
                }}
                className="absolute flex flex-col items-center"
              >
                {/* Balloon Body */}
                <div
                  className="rounded-full relative"
                  style={{
                    width: `${b.size}px`,
                    height: `${b.size * 1.2}px`,
                    backgroundColor: b.color,
                    boxShadow: 'inset -5px -10px 15px rgba(0,0,0,0.15)',
                  }}
                >
                  {/* Balloon Reflection Highlight */}
                  <div className="absolute top-2 left-2 w-2.5 h-4 bg-white/40 rounded-full" />
                </div>
                {/* Balloon Knot */}
                <div
                  className="w-0 h-0 border-t-4 border-r-4 border-l-4 border-b-0 border-transparent"
                  style={{ borderTopColor: b.color }}
                />
                {/* Balloon String */}
                <div className="w-[1px] h-12 bg-slate-300/40" />
              </motion.div>
            ))}
          </div>

          {/* Interactive Anniversary Card */}
          <motion.div
            initial={{ scale: 0.4, y: 100, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.7, y: 50, opacity: 0 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative z-10 w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-3xl border border-slate-100 mx-4"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-full p-1 hover:bg-slate-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Icon */}
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-400 to-teal-500 text-white shadow-xl shadow-cyan-400/20">
              <motion.div
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  repeatType: 'reverse',
                }}
              >
                <Cake className="w-10 h-10" />
              </motion.div>
            </div>

            {/* Content */}
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-600">
              <Sparkles className="w-3.5 h-3.5" /> BIRTHDAY CELEBRATION
            </span>

            <h2 className="mt-4 font-display text-2xl font-bold text-slate-800 tracking-tight leading-none">
              Happy Birthday,
            </h2>
            <h1 className="mt-1 font-sans text-3xl font-extrabold text-cyan-500 tracking-tight">
              {name}!
            </h1>

            <p className="mt-4 font-sans text-sm text-slate-500 leading-relaxed">
              We wish you an extraordinary year filled with happiness, growth, and wonderful milestones! Enjoy your special day! 🎉🎂
            </p>

            <button
              onClick={onClose}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 font-sans font-semibold text-white shadow-lg shadow-cyan-500/15 hover:from-cyan-600 hover:to-teal-600 transition-all cursor-pointer hover:shadow-cyan-500/25 active:scale-98"
            >
              Thank You!
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
