import React from 'react';
import { cn } from '../utils/cn';

const MOOD_COLORS = {
  happy:     'bg-emerald-500 hover:bg-emerald-400 dark:bg-emerald-500/80 dark:hover:bg-emerald-400/90',
  neutral:   'bg-slate-400 hover:bg-slate-350 dark:bg-slate-500/70 dark:hover:bg-slate-400/80',
  sad:       'bg-blue-450 hover:bg-blue-400 dark:bg-blue-500/80 dark:hover:bg-blue-400/90',
  stressed:  'bg-amber-450 hover:bg-amber-400 dark:bg-amber-500/80 dark:hover:bg-amber-400/90',
  motivated: 'bg-brand hover:bg-brand-hover dark:bg-brand/80 dark:hover:bg-brand/90',
};

const MOOD_EMOJIS = {
  happy: '😊',
  neutral: '😐',
  sad: '😢',
  stressed: '⚡',
  motivated: '🚀'
};

export function ContributionHeatmap({ dailyMoods = [] }) {
  // We want to generate a grid of 53 weeks, ending today.
  // Group days by columns (weeks)
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
  
  // To align the grid, we start 52 weeks ago from the Sunday of that week
  // Total days to display = 53 weeks * 7 days
  const totalDays = 53 * 7;
  const gridWeeks = [];

  const startDate = new Date();
  startDate.setDate(today.getDate() - totalDays + 1 + (6 - dayOfWeek)); // align end day to Saturday

  let currentDate = new Date(startDate);

  // Generate 53 columns (weeks)
  for (let w = 0; w < 53; w++) {
    const weekDays = [];
    for (let d = 0; d < 7; d++) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      const isFuture = currentDate > today;
      
      const match = dailyMoods.find(m => m.date === dateStr);
      
      weekDays.push({
        date: new Date(currentDate),
        isoString: dateStr,
        isFuture,
        feeling: match?.feeling?.toLowerCase() || null
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    gridWeeks.push(weekDays);
  }

  // Generate Month Labels
  const monthLabels = [];
  let prevMonth = -1;
  
  gridWeeks.forEach((week, index) => {
    const firstDayOfWeek = week[0].date;
    const currentMonth = firstDayOfWeek.getMonth();
    
    if (currentMonth !== prevMonth) {
      const label = firstDayOfWeek.toLocaleDateString('en-US', { month: 'short' });
      // Calculate a rough span of weeks for this label
      monthLabels.push({ index, label });
      prevMonth = currentMonth;
    }
  });

  return (
    <div className="w-full bg-input-bg/30 border border-border/40 rounded-3xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-text-primary">Mood Journey Heatmap</h4>
          <p className="text-xs text-text-tertiary mt-0.5">Your daily reflections and moods over the past year.</p>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] text-text-secondary font-medium">
          <span>Less</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-border/40" />
          <div className="h-2.5 w-2.5 rounded-sm bg-slate-500/50" />
          <div className="h-2.5 w-2.5 rounded-sm bg-blue-500/70" />
          <div className="h-2.5 w-2.5 rounded-sm bg-amber-500/70" />
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/70" />
          <div className="h-2.5 w-2.5 rounded-sm bg-brand/70" />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="overflow-x-auto no-scrollbar scroll-smooth">
        <div className="min-w-[720px] flex flex-col gap-1 select-none py-1">
          
          {/* Month Header Row */}
          <div className="relative h-4 text-[10px] font-semibold text-text-tertiary select-none">
            {monthLabels.map(({ index, label }, i) => (
              <span 
                key={i} 
                className="absolute" 
                style={{ left: `${index * 13 + 30}px` }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-1.5">
            {/* Days of Week Label Column */}
            <div className="flex flex-col justify-between text-[9px] font-bold text-text-tertiary uppercase pr-1.5 w-6 h-[88px] shrink-0 text-right leading-none py-0.5">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* Heatmap Columns */}
            <div className="flex gap-1 flex-1">
              {gridWeeks.map((week, wIndex) => (
                <div key={wIndex} className="flex flex-col gap-1">
                  {week.map(({ date, isoString, isFuture, feeling }, dIndex) => {
                    const hasEntry = !!feeling;
                    const moodColor = feeling ? MOOD_COLORS[feeling] : 'bg-border/20 dark:bg-border/10';
                    const displayDate = date.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    });

                    return (
                      <div 
                        key={dIndex}
                        className={cn(
                          "h-2.5 w-2.5 rounded-sm transition-all duration-200 relative group shrink-0",
                          isFuture ? "opacity-0 pointer-events-none" : moodColor,
                          !isFuture && !hasEntry && "hover:bg-border/40"
                        )}
                      >
                        {/* Tooltip */}
                        {!isFuture && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            <div className="bg-card-bg border border-border/60 rounded-lg px-2.5 py-1.5 shadow-xl text-center whitespace-nowrap">
                              <p className="text-[10px] font-bold text-text-primary">{displayDate}</p>
                              <p className="text-[10px] text-text-secondary mt-0.5">
                                {feeling 
                                  ? `Mood: ${MOOD_EMOJIS[feeling]} ${feeling.charAt(0).toUpperCase() + feeling.slice(1)}` 
                                  : 'No entry written'
                                }
                              </p>
                            </div>
                            <div className="mx-auto w-2 h-2 bg-card-bg border-r border-b border-border/60 rotate-45 -mt-1" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
