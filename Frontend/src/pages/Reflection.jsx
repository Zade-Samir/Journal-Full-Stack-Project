import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, Smile, Compass, Trophy, Calendar, Loader2, AlertCircle, 
  ArrowRight, Heart, Brain, Flame, Star, MessageSquareCode, CalendarDays, CheckCircle2 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { cn } from '../utils/cn';
import { HeaderActions } from '../components/HeaderActions';
import { useAppSettings } from '../context/AppSettingsContext';

const MOOD_META = {
  happy: { label: 'Happy', emoji: '😊', bgClass: 'bg-emerald-500', textClass: 'text-emerald-400', lightBg: 'bg-emerald-500/10' },
  neutral: { label: 'Neutral', emoji: '😐', bgClass: 'bg-sky-500', textClass: 'text-sky-400', lightBg: 'bg-sky-500/10' },
  sad: { label: 'Sad', emoji: '😢', bgClass: 'bg-indigo-500', textClass: 'text-indigo-400', lightBg: 'bg-indigo-500/10' },
  stressed: { label: 'Stressed', emoji: '⚡', bgClass: 'bg-amber-500', textClass: 'text-amber-400', lightBg: 'bg-amber-500/10' },
  motivated: { label: 'Motivated', emoji: '🚀', bgClass: 'bg-purple-500', textClass: 'text-purple-400', lightBg: 'bg-purple-500/10' },
};

export function Reflection() {
  const { isFullWidth } = useAppSettings();
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  // Custom range states
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const fetchReflection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization required. Please log in.');

      let url = `${API_BASE_URL}/journal/reflection?range=${range}`;
      if (showCustomRange && customStart && customEnd) {
        url = `${API_BASE_URL}/journal/reflection?startDate=${customStart}&endDate=${customEnd}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to fetch reflection summary');
      }
      setSummary(data.data);
    } catch (err) {
      setError(err.message || 'Error loading reflection.');
    } finally {
      setLoading(false);
    }
  }, [range, showCustomRange, customStart, customEnd]);

  useEffect(() => {
    fetchReflection();
  }, [fetchReflection]);

  // Compute total gratitude
  const gratitudeCount = summary?.gratitudeList?.length || 0;

  // Dominant Mood metadata
  const moodName = summary?.dominantMood?.toLowerCase() || 'neutral';
  const dominantMoodDetail = MOOD_META[moodName] || { label: 'N/A', emoji: '—', textClass: 'text-text-secondary' };

  return (
    <div className={cn(
      "mx-auto px-6 py-12 md:py-20", 
      isFullWidth ? "max-w-[120rem] md:px-16" : "max-w-6xl"
    )}>
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 shrink-0">
        <div>
          <h2 className="text-3xl font-semibold text-text-primary tracking-tight">Week in Review</h2>
          <p className="text-text-secondary text-sm mt-1">Reflect on your journals, emotional baseline, and achievements over time.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Quick ranges */}
          <div className="flex bg-input-bg rounded-xl p-1 border border-border/40">
            {[
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
            ].map(r => (
              <button
                key={r.value}
                onClick={() => {
                  setShowCustomRange(false);
                  setRange(r.value);
                }}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  range === r.value && !showCustomRange
                    ? "bg-card-bg text-brand shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {r.label}
              </button>
            ))}
            <button
              onClick={() => setShowCustomRange(true)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1",
                showCustomRange ? "bg-card-bg text-brand shadow-sm" : "text-text-secondary hover:text-text-primary"
              )}
            >
              <Calendar size={12} /> Custom
            </button>
          </div>

          <HeaderActions />
        </div>
      </header>

      {showCustomRange && (
        <div className="bg-input-bg/40 p-4 rounded-2xl border border-border/30 mb-8 max-w-xl flex flex-wrap items-end gap-4 animate-in slide-in-from-top duration-200">
          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">Start Date</label>
            <input 
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="bg-card-bg border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block">End Date</label>
            <input 
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="bg-card-bg border border-border rounded-xl px-3 py-1.5 text-xs text-text-primary focus:outline-none"
            />
          </div>
          <button
            onClick={fetchReflection}
            disabled={!customStart || !customEnd}
            className="px-4 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition-all disabled:opacity-50"
          >
            Apply Range
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-3 items-center text-red-500 text-sm">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-tertiary">
          <Loader2 size={32} className="animate-spin text-brand" />
          <p className="text-sm font-medium">Aggregating summaries...</p>
        </div>
      ) : summary && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Aggregates row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* DOMINANT MOOD CARD */}
            <div className="bg-card-bg border border-border/50 rounded-3xl p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Dominant Mood</p>
                <h4 className={cn("text-2xl font-bold tracking-tight", dominantMoodDetail.textClass)}>
                  {dominantMoodDetail.label}
                </h4>
                <p className="text-xs text-text-tertiary">Baseline emotional pattern</p>
              </div>
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-3xl", dominantMoodDetail.lightBg)}>
                {dominantMoodDetail.emoji}
              </div>
            </div>

            {/* ENTRIES STAT CARD */}
            <div className="bg-card-bg border border-border/50 rounded-3xl p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Consistency</p>
                <h4 className="text-2xl font-bold tracking-tight text-text-primary">
                  {summary.totalEntries} <span className="text-sm font-normal text-text-secondary">entries</span>
                </h4>
                <p className="text-xs text-text-tertiary">Logged between {new Date(summary.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(summary.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <CalendarDays size={28} />
              </div>
            </div>

            {/* ACHIEVEMENTS STAT CARD */}
            <div className="bg-card-bg border border-border/50 rounded-3xl p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Goal Milestones</p>
                <h4 className="text-2xl font-bold tracking-tight text-emerald-400">
                  {summary.completedGoals?.length || 0} <span className="text-sm font-normal text-text-secondary">completed</span>
                </h4>
                <p className="text-xs text-text-tertiary">{summary.activeGoals?.length || 0} active goals remaining</p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Trophy size={28} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column (Mood distribution & Gratitude Collage) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Gratitude Wall */}
              <section className="bg-card-bg/40 border border-border/50 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                    <Heart size={16} className="fill-pink-500/10" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Gratitude Board</h3>
                    <p className="text-[10px] text-text-tertiary font-medium">All the small sparks of thankfulness you noted</p>
                  </div>
                  <span className="text-xs font-bold text-text-secondary px-2.5 py-0.5 bg-input-bg rounded-md ml-auto">
                    {gratitudeCount} Statements
                  </span>
                </div>

                {gratitudeCount === 0 ? (
                  <div className="text-center py-16 text-text-tertiary border border-dashed border-border rounded-2xl">
                    <Heart size={28} className="mx-auto mb-2 opacity-35" />
                    <p className="text-xs">No gratitude statements found in this range. Write daily and reflect!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {summary.gratitudeList.map((statement, idx) => (
                      <div 
                        key={idx}
                        className={cn(
                          "p-4 rounded-2xl border transition-all hover:translate-y-[-2px] relative overflow-hidden bg-card-bg",
                          idx % 3 === 0 ? "border-pink-500/15" : 
                          idx % 3 === 1 ? "border-purple-500/15" : "border-amber-500/15"
                        )}
                      >
                        <div className="flex gap-2.5 items-start">
                          <Star size={12} className={cn(
                            "mt-0.5 shrink-0 fill-current",
                            idx % 3 === 0 ? "text-pink-400" : 
                            idx % 3 === 1 ? "text-purple-400" : "text-amber-400"
                          )} />
                          <p className="text-xs text-text-secondary font-medium leading-relaxed italic">{statement}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Mood Balance */}
              <section className="bg-card-bg/40 border border-border/50 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                    <Brain size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Mood Frequency Balance</h3>
                    <p className="text-[10px] text-text-tertiary font-medium">Distribution of emotions over this period</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.keys(MOOD_META).map(key => {
                    const count = summary.moodFrequency[key] || 0;
                    const pct = summary.totalEntries > 0 ? Math.round((count / summary.totalEntries) * 100) : 0;
                    const meta = MOOD_META[key];

                    return (
                      <div key={key} className="flex items-center gap-4 text-xs font-semibold">
                        <span className="w-6 text-center text-lg">{meta.emoji}</span>
                        <span className="w-20 text-text-secondary truncate">{meta.label}</span>
                        <div className="flex-1 bg-input-bg h-2 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500", meta.bgClass)}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-text-secondary">{count} logs ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </section>

            </div>

            {/* Right Column (Goals Summary & AI Summary Placeholder) */}
            <div className="space-y-8">
              
              {/* Goals Summary Panel */}
              <section className="bg-card-bg/40 border border-border/50 rounded-3xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Trophy size={16} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary">Goals Accomplished</h3>
                    <p className="text-[10px] text-text-tertiary font-medium">Path milestones checked off during this range</p>
                  </div>
                </div>

                {summary.completedGoals?.length === 0 ? (
                  <div className="text-center py-10 text-text-tertiary border border-dashed border-border rounded-2xl text-xs mb-6">
                    No goals completed in this period. Small steps lead to big horizons!
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {summary.completedGoals.map(goal => (
                      <div key={goal.id} className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        <span className="text-xs text-text-primary font-semibold line-clamp-1">{goal.title}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Remaining Tasks</h4>
                    <span className="text-[10px] text-brand font-bold bg-brand/10 px-2 py-0.5 rounded-full">{summary.activeGoals?.length || 0} active</span>
                  </div>
                  
                  {summary.activeGoals?.length === 0 ? (
                    <div className="text-center py-6 text-text-tertiary text-xs bg-input-bg/30 rounded-xl">
                      All caught up! Time to create a new goal.
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-2">
                      {summary.activeGoals.map(goal => (
                        <div key={goal.id} className="p-2.5 bg-input-bg/50 border border-border/30 rounded-xl flex justify-between items-center">
                          <span className="text-xs text-text-secondary truncate pr-3">{goal.title}</span>
                          <span className={cn(
                            "text-[8px] font-bold px-1.5 py-0.5 rounded shrink-0 uppercase tracking-widest",
                            goal.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400' : 'bg-text-secondary/15 text-text-secondary'
                          )}>
                            {goal.status === 'IN_PROGRESS' ? 'In Progress' : 'Not Started'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* AI Insights Card Placeholder */}
              <section className="bg-gradient-to-br from-brand/15 to-purple-500/15 border border-brand/35 rounded-3xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand/10 rounded-full filter blur-xl group-hover:scale-125 transition-transform" />
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-brand/20 text-brand flex items-center justify-center">
                    <Sparkles size={16} className="animate-[pulse_4s_infinite]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-brand uppercase tracking-wider">AI Summarization</h3>
                    <p className="text-[9px] text-text-tertiary font-medium">Coming soon in Track C</p>
                  </div>
                </div>

                <p className="text-xs text-text-secondary leading-relaxed mb-6 font-medium">
                  Soon, a custom AI assistant will automatically analyze your journal entries over this period, surfacing deep behavioral insights, recurring triggers, and personalized psychological guidance.
                </p>

                <div className="h-14 bg-card-bg/50 border border-border/50 rounded-2xl flex items-center justify-center text-text-tertiary text-xs font-semibold select-none border-dashed">
                  AI Summary Engine Offline
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
