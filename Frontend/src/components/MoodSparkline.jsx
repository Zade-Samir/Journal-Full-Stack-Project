import React from 'react';
import { cn } from '../utils/cn';

const MOOD_CONFIG = {
  happy:     { emoji: '😊', color: 'bg-emerald-400', ring: 'ring-emerald-400/40', label: 'Happy' },
  neutral:   { emoji: '😐', color: 'bg-slate-400',   ring: 'ring-slate-400/40',   label: 'Neutral' },
  sad:       { emoji: '😢', color: 'bg-blue-400',    ring: 'ring-blue-400/40',    label: 'Sad' },
  stressed:  { emoji: '⚡', color: 'bg-amber-400',   ring: 'ring-amber-400/40',   label: 'Stressed' },
  motivated: { emoji: '🚀', color: 'bg-violet-400',  ring: 'ring-violet-400/40',  label: 'Motivated' },
};

/**
 * Renders a 7-day mood sparkline as a row of coloured dots.
 * @param {Array<{date: string, feeling: string}>} dailyMoods — from /journal/stats
 */
export function MoodSparkline({ dailyMoods = [] }) {
  // Build an ordered array of the last 7 days (today first)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i)); // oldest → newest
    const iso = d.toISOString().slice(0, 10);
    const label = i === 6 ? 'Today' : i === 5 ? 'Yesterday' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const match = dailyMoods.find(m => m.date === iso);
    return { iso, label, feeling: match?.feeling?.toLowerCase() || null };
  });

  return (
    <div className="flex items-center gap-2" title="Your mood over the last 7 days">
      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.12em] mr-1 hidden sm:inline">
        7d
      </span>
      {days.map(({ iso, label, feeling }) => {
        const config = feeling ? MOOD_CONFIG[feeling] : null;
        return (
          <div key={iso} className="group relative flex flex-col items-center gap-1">
            <div
              className={cn(
                'h-5 w-5 rounded-full transition-all duration-300 ring-2',
                config
                  ? `${config.color} ${config.ring} group-hover:scale-125`
                  : 'bg-border ring-border/30 group-hover:scale-110'
              )}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-card-bg border border-border/60 rounded-lg px-2 py-1 shadow-xl text-center whitespace-nowrap">
                <p className="text-[10px] font-semibold text-text-primary">{label}</p>
                <p className="text-[10px] text-text-tertiary">
                  {config ? `${config.emoji} ${config.label}` : 'No entry'}
                </p>
              </div>
              {/* Arrow */}
              <div className="mx-auto w-2 h-2 bg-card-bg border-r border-b border-border/60 rotate-45 -mt-1" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
