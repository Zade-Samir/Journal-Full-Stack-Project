import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart2, Calendar, TrendingUp, Loader2, AlertCircle, 
  Smile, Meh, Frown, Zap, Rocket, Activity, Flame, Award
} from 'lucide-react';
import { HeaderActions } from '../components/HeaderActions';
import { useAppSettings } from '../context/AppSettingsContext';
import { cn } from '../utils/cn';
import { API_BASE_URL } from '../config/api';

const MOOD_META = {
  happy: { label: 'Happy', emoji: '😊', bgClass: 'bg-emerald-500', textClass: 'text-emerald-400', borderClass: 'border-emerald-500/20', lightBg: 'bg-emerald-500/10' },
  neutral: { label: 'Neutral', emoji: '😐', bgClass: 'bg-sky-500', textClass: 'text-sky-400', borderClass: 'border-sky-500/20', lightBg: 'bg-sky-500/10' },
  sad: { label: 'Sad', emoji: '😢', bgClass: 'bg-indigo-500', textClass: 'text-indigo-400', borderClass: 'border-indigo-500/20', lightBg: 'bg-indigo-500/10' },
  stressed: { label: 'Stressed', emoji: '⚡', bgClass: 'bg-amber-500', textClass: 'text-amber-400', borderClass: 'border-amber-500/20', lightBg: 'bg-amber-500/10' },
  motivated: { label: 'Motivated', emoji: '🚀', bgClass: 'bg-purple-500', textClass: 'text-purple-400', borderClass: 'border-purple-500/20', lightBg: 'bg-purple-500/10' },
};

const MOOD_SCORES = {
  motivated: 5,
  happy: 4,
  neutral: 3,
  stressed: 2,
  sad: 1
};

export function Analytics() {
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ moodCounts: [], dailyMoods: [] });
  const [streak, setStreak] = useState(0);
  const { isFullWidth } = useAppSettings();

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required. Please log in.');

      const [statsRes, streakRes] = await Promise.all([
        fetch(`${API_BASE_URL}/journal/stats?range=${range}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/journal/streak`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const statsJson = await statsRes.json();
      if (!statsRes.ok || statsJson.success === false) {
        throw new Error(statsJson.message || 'Failed to fetch analytics data');
      }

      setStats(statsJson.data || { moodCounts: [], dailyMoods: [] });

      if (streakRes.ok) {
        const streakJson = await streakRes.json();
        if (streakJson.success) {
          setStreak(streakJson.data.streak);
        }
      }
    } catch (err) {
      setError(err.message || 'Error loading analytics.');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Compute stats helper
  const moodCountsMap = stats.moodCounts.reduce((acc, curr) => {
    acc[curr.feeling.toLowerCase()] = curr.count;
    return acc;
  }, {});

  const totalLogs = stats.dailyMoods.length;

  // Determine dominant mood
  let dominantMood = 'N/A';
  let maxCount = 0;
  Object.keys(MOOD_META).forEach(m => {
    const count = moodCountsMap[m] || 0;
    if (count > maxCount) {
      maxCount = count;
      dominantMood = m;
    }
  });

  // Dominant Mood Detail
  const domMoodDetail = MOOD_META[dominantMood] || { label: 'No Data', emoji: '—', textClass: 'text-text-secondary' };

  // Logging rate calculation
  const totalDaysInRange = range === '7d' ? 7 : range === '90d' ? 90 : 30;
  const loggingRate = totalLogs > 0 ? Math.round((totalLogs / totalDaysInRange) * 100) : 0;

  // Average mood score
  let averageMoodScore = 0;
  let totalScore = 0;
  stats.dailyMoods.forEach(entry => {
    const score = MOOD_SCORES[entry.feeling.toLowerCase()] || 0;
    totalScore += score;
  });
  if (totalLogs > 0) {
    averageMoodScore = (totalScore / totalLogs).toFixed(1);
  }

  const currentStreak = streak;

  // Generate heatmap matrix (365 days)
  const getHeatmapData = () => {
    const days = [];
    const today = new Date();
    
    // 364 days ago + today = 365 days
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    const startDayOfWeek = startDate.getDay(); // 0 = Sunday, 6 = Saturday

    // Pad first week with dummy dates
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push({ dummy: true });
    }

    // Index daily feelings by date
    const dailyMoodIndex = stats.dailyMoods.reduce((acc, curr) => {
      acc[curr.date] = curr.feeling.toLowerCase();
      return acc;
    }, {});

    const cursor = new Date(startDate);
    while (cursor <= today) {
      const dateStr = cursor.toISOString().slice(0, 10);
      days.push({
        dummy: false,
        date: new Date(cursor),
        dateStr,
        feeling: dailyMoodIndex[dateStr] || null
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  };

  const heatmapDays = getHeatmapData();

  // Custom Line Chart coordinates generator
  const getLineChartPoints = (width, height) => {
    const validEntries = stats.dailyMoods.filter(entry => MOOD_SCORES[entry.feeling.toLowerCase()]);
    if (validEntries.length === 0) return [];

    const paddingX = 40;
    const paddingY = 25;
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    const points = validEntries.map((entry, idx) => {
      const x = paddingX + (validEntries.length > 1 ? (idx / (validEntries.length - 1)) * chartW : chartW / 2);
      const score = MOOD_SCORES[entry.feeling.toLowerCase()];
      // Score ranges 1 to 5, invert so 5 is at the top (lowest Y)
      const y = paddingY + chartH - ((score - 1) / 4) * chartH;
      
      const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      return {
        x,
        y,
        dateLabel: formattedDate,
        mood: entry.feeling,
        score
      };
    });

    return points;
  };

  const width = 600;
  const height = 240;
  const linePoints = getLineChartPoints(width, height);
  
  // Construct path definitions
  const linePathD = linePoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPathD = linePoints.length > 0 
    ? `${linePathD} L ${linePoints[linePoints.length - 1].x} ${height - 25} L ${linePoints[0].x} ${height - 25} Z` 
    : '';

  // Standard labels for heatmap week headers
  const getMonthLabels = () => {
    const months = [];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 364);

    const cursor = new Date(startDate);
    let lastMonth = -1;

    // Check which column each month starts in
    // Total days/7 = column
    let dayCount = 0;
    while (cursor <= today) {
      const currentMonth = cursor.getMonth();
      const dayOfWeek = cursor.getDay();
      
      // If Sunday and it's a new month
      if (currentMonth !== lastMonth && dayOfWeek === 0) {
        months.push({
          label: cursor.toLocaleString('default', { month: 'short' }),
          colIndex: Math.floor(dayCount / 7)
        });
        lastMonth = currentMonth;
      }
      dayCount++;
      cursor.setDate(cursor.getDate() + 1);
    }
    return months;
  };

  const monthLabels = getMonthLabels();

  return (
    <div className={cn(
      'mx-auto px-6 py-12 md:py-20 animate-in slide-in-from-bottom-4 fade-in duration-500',
      isFullWidth ? 'max-w-[120rem] md:px-16 lg:px-24' : 'max-w-5xl'
    )}>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-2">Mood Analytics</h1>
          <p className="text-text-secondary text-base">
            Gain deep insight into your emotional patterns and habits.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <div className="flex bg-input-bg border border-border/50 p-1 rounded-xl shadow-inner">
            {['7d', '30d', '90d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                  range === r
                    ? 'bg-brand text-white shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <HeaderActions className="ml-1" />
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-brand" size={36} />
          <p className="text-text-secondary text-sm">Analyzing your digital vellum...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 bg-input-bg/40 border border-border/40 rounded-2xl p-8 gap-4 text-center">
          <AlertCircle className="text-red-500" size={40} />
          <div>
            <h3 className="text-text-primary font-bold text-lg mb-1">Failed to load analytics</h3>
            <p className="text-text-secondary text-sm">{error}</p>
          </div>
          <button 
            onClick={fetchStats}
            className="px-5 py-2 rounded-full text-xs font-semibold bg-brand text-white hover:bg-brand-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Total Days Logged */}
            <div className="bg-card-bg border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-text-tertiary/20 group-hover:scale-110 transition-transform duration-200">
                <Calendar size={48} className="stroke-[1.25]" />
              </div>
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Total Logs</p>
              <h2 className="text-3xl font-black text-text-primary mb-1">{totalLogs}</h2>
              <p className="text-xs text-text-secondary font-medium">Logged entries in range</p>
            </div>

            {/* KPI 2: Dominant Mood */}
            <div className="bg-card-bg border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-text-tertiary/20 group-hover:scale-110 transition-transform duration-200">
                <Smile size={48} className="stroke-[1.25]" />
              </div>
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Dominant Mood</p>
              <h2 className={cn("text-3xl font-black mb-1 flex items-center gap-2", domMoodDetail.textClass)}>
                <span>{domMoodDetail.emoji}</span>
                <span>{domMoodDetail.label}</span>
              </h2>
              <p className="text-xs text-text-secondary font-medium">
                {maxCount > 0 ? `${maxCount} occurrences` : 'No logs recorded'}
              </p>
            </div>

            {/* KPI 3: Logging Frequency */}
            <div className="bg-card-bg border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-text-tertiary/20 group-hover:scale-110 transition-transform duration-200">
                <Activity size={48} className="stroke-[1.25]" />
              </div>
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Logging Rate</p>
              <h2 className="text-3xl font-black text-text-primary mb-1">{loggingRate}%</h2>
              <p className="text-xs text-text-secondary font-medium">
                Logged {totalLogs} of {totalDaysInRange} days
              </p>
            </div>

            {/* KPI 4: Current Streak */}
            <div className="bg-card-bg border border-border/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-text-tertiary/20 group-hover:scale-110 transition-transform duration-200">
                <Flame size={48} className="stroke-[1.25]" />
              </div>
              <p className="text-xs font-bold text-text-tertiary uppercase tracking-wider mb-2">Current Streak</p>
              <h2 className="text-3xl font-black text-text-primary mb-1 flex items-center gap-1.5">
                <span>{currentStreak}</span>
                <span className="text-orange-500 text-2xl font-bold">🔥</span>
              </h2>
              <p className="text-xs text-text-secondary font-medium">
                Consecutive days logged
              </p>
            </div>

          </div>

          {/* Contribution Heatmap Card */}
          <div className="bg-card-bg border border-border/40 rounded-2xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary mb-0.5">Yearly Mood Heatmap</h3>
                <p className="text-xs text-text-secondary">A visual timeline of your mood history over the last 365 days.</p>
              </div>
              
              {/* Heatmap Legend */}
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-text-secondary font-semibold">
                <span>Less</span>
                <div className="w-2.5 h-2.5 rounded-[1px] bg-border/20 dark:bg-white/5" />
                {Object.keys(MOOD_META).map((k) => (
                  <div key={k} className="flex items-center gap-1">
                    <div className={cn("w-2.5 h-2.5 rounded-[1px]", MOOD_META[k].bgClass)} />
                    <span className="capitalize">{MOOD_META[k].label}</span>
                  </div>
                ))}
                <span>More</span>
              </div>
            </div>

            {/* Grid Container */}
            <div className="overflow-x-auto no-scrollbar">
              <div className="min-w-[700px] flex flex-col pb-2">
                
                {/* Month labels */}
                <div className="relative h-5 text-[9px] text-text-tertiary font-bold tracking-wider uppercase mb-1">
                  {monthLabels.map((m, idx) => (
                    <span 
                      key={idx} 
                      className="absolute"
                      style={{ left: `${m.colIndex * 13 + 30}px` }}
                    >
                      {m.label}
                    </span>
                  ))}
                </div>

                {/* Main grid table */}
                <div className="flex gap-2">
                  
                  {/* Row headers (Day of week) */}
                  <div className="flex flex-col justify-between text-[8px] font-bold text-text-tertiary uppercase h-[92px] w-6 pr-2 py-0.5 select-none shrink-0">
                    <span>Mon</span>
                    <span>Wed</span>
                    <span>Fri</span>
                  </div>

                  {/* Heatmap cells (53 columns x 7 rows) */}
                  <div className="grid grid-flow-col grid-rows-7 gap-1 h-[92px]">
                    {heatmapDays.map((day, idx) => {
                      if (day.dummy) {
                        return <div key={idx} className="w-2.5 h-2.5" />;
                      }

                      const moodMeta = MOOD_META[day.feeling];
                      const moodLabel = moodMeta ? moodMeta.label : 'Empty Day';
                      const emoji = moodMeta ? moodMeta.emoji : '';
                      const bgClass = moodMeta ? moodMeta.bgClass : 'bg-border/20 dark:bg-white/5';
                      
                      const dateFormatted = new Date(day.dateStr).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });

                      return (
                        <div key={idx} className="relative group cursor-pointer">
                          <div className={cn("w-2.5 h-2.5 rounded-[1.5px] transition-colors duration-150", bgClass)} />
                          
                          {/* CSS Hover Tooltip Card */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center bg-card-bg border border-border text-[10px] text-text-primary py-1.5 px-2.5 rounded-lg shadow-2xl z-50 pointer-events-none whitespace-nowrap min-w-[120px]">
                            <p className="font-bold text-text-secondary text-[8px] uppercase tracking-wider">{dateFormatted}</p>
                            <p className="font-semibold text-text-primary mt-0.5 flex items-center gap-1 justify-center">
                              {emoji && <span>{emoji}</span>}
                              <span>{moodLabel}</span>
                            </p>
                            <div className="w-2 h-2 bg-card-bg border-r border-b border-border rotate-45 absolute top-full -mt-1 left-1/2 -translate-x-1/2" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            </div>
            
            {/* Heatmap Legend for Mobile (small screens) */}
            <div className="flex sm:hidden flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-border/20 text-[9px] text-text-secondary font-semibold">
              <div className="flex items-center gap-1 mr-2">
                <div className="w-2 h-2 rounded-[1px] bg-border/20 dark:bg-white/5" />
                <span>Empty</span>
              </div>
              {Object.keys(MOOD_META).map((k) => (
                <div key={k} className="flex items-center gap-1">
                  <div className={cn("w-2 h-2 rounded-[1px]", MOOD_META[k].bgClass)} />
                  <span className="capitalize">{MOOD_META[k].label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Chart 1: Mood Trends over Time (Line Chart) */}
            <div className="bg-card-bg border border-border/40 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-brand stroke-[2]" size={18} />
                <h3 className="text-base font-bold text-text-primary">Mood Trend Line</h3>
              </div>

              {linePoints.length <= 1 ? (
                <div className="flex flex-col items-center justify-center h-[200px] border border-dashed border-border/40 rounded-xl gap-2 text-center p-4">
                  <Activity className="text-text-tertiary/40" size={32} />
                  <p className="text-xs text-text-secondary">
                    {linePoints.length === 1 
                      ? 'Need at least 2 entries in this range to plot a trend line.'
                      : 'No mood logs available in the selected range.'}
                  </p>
                </div>
              ) : (
                <div className="relative w-full overflow-hidden">
                  <svg 
                    viewBox={`0 0 ${width} ${height}`} 
                    className="w-full h-auto overflow-visible"
                    style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}
                  >
                    <defs>
                      <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y Axis Grid Lines */}
                    {[1, 2, 3, 4, 5].map((val) => {
                      const yVal = 25 + (height - 50) - ((val - 1) / 4) * (height - 50);
                      const moodLabel = Object.keys(MOOD_SCORES).find(k => MOOD_SCORES[k] === val);
                      const emoji = MOOD_META[moodLabel]?.emoji || '';
                      
                      return (
                        <g key={val} className="opacity-40">
                          <line 
                            x1={40} 
                            y1={yVal} 
                            x2={width - 40} 
                            y2={yVal} 
                            className="stroke-border/40" 
                            strokeDasharray="4 4" 
                          />
                          <text 
                            x={15} 
                            y={yVal + 3} 
                            className="fill-text-tertiary text-[9px] font-bold text-right select-none"
                          >
                            {emoji}
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient Area Fill Under Line */}
                    <path 
                      d={areaPathD} 
                      fill="url(#trendGradient)" 
                      className="transition-all duration-300"
                    />

                    {/* Actual Trend Line */}
                    <path 
                      d={linePathD} 
                      fill="none" 
                      className="stroke-brand transition-all duration-300" 
                      strokeWidth={2.5}
                    />

                    {/* Interactive Circle Nodes */}
                    {linePoints.map((p, idx) => {
                      const meta = MOOD_META[p.mood.toLowerCase()] || { emoji: '😊' };
                      return (
                        <g key={idx} className="group/point">
                          <circle 
                            cx={p.x} 
                            cy={p.y} 
                            r={4} 
                            className="fill-brand stroke-bg-base stroke-2 group-hover/point:r-5 group-hover/point:fill-text-primary transition-all duration-150 cursor-pointer"
                          />
                          
                          {/* Circle Hover Tooltip Popover */}
                          <foreignObject 
                            x={p.x - 50} 
                            y={p.y - 50} 
                            width={100} 
                            height={45} 
                            className="pointer-events-none hidden group-hover/point:block z-50 overflow-visible"
                          >
                            <div className="bg-card-bg border border-border text-[9px] text-text-primary py-1 px-1.5 rounded-lg shadow-xl text-center relative">
                              <p className="font-bold text-text-secondary text-[7px] uppercase tracking-wider">{p.dateLabel}</p>
                              <p className="capitalize text-text-primary font-bold mt-0.5 flex items-center justify-center gap-1">
                                <span>{meta.emoji}</span>
                                <span>{meta.label}</span>
                              </p>
                              <div className="w-1.5 h-1.5 bg-card-bg border-r border-b border-border rotate-45 absolute top-full -mt-1.5 left-1/2 -translate-x-1/2" />
                            </div>
                          </foreignObject>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>

            {/* Chart 2: Mood Frequency Distribution (Bar Chart) */}
            <div className="bg-card-bg border border-border/40 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="text-brand stroke-[2]" size={18} />
                <h3 className="text-base font-bold text-text-primary">Mood Distribution</h3>
              </div>

              {totalLogs === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] border border-dashed border-border/40 rounded-xl gap-2 text-center p-4">
                  <Smile className="text-text-tertiary/40" size={32} />
                  <p className="text-xs text-text-secondary">No mood logs available in the selected range.</p>
                </div>
              ) : (
                <div className="space-y-4 py-2">
                  {Object.keys(MOOD_META).map((m) => {
                    const count = moodCountsMap[m] || 0;
                    const percent = totalLogs > 0 ? Math.round((count / totalLogs) * 100) : 0;
                    const meta = MOOD_META[m];
                    
                    return (
                      <div key={m} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="flex items-center gap-2 text-text-secondary">
                            <span>{meta.emoji}</span>
                            <span>{meta.label}</span>
                          </span>
                          <span className="text-text-primary">
                            {count} {count === 1 ? 'log' : 'logs'} <span className="text-text-tertiary font-normal">({percent}%)</span>
                          </span>
                        </div>
                        
                        {/* Horizontal Bar Track */}
                        <div className="h-2.5 w-full bg-border/20 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500 ease-out", meta.bgClass)}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
