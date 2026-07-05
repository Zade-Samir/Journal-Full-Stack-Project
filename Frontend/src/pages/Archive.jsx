import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Calendar, Filter, Loader2, AlertCircle, X, ChevronDown } from 'lucide-react';
import { JournalCard } from '../components/JournalCard';
import { JournalModal } from '../components/JournalModal';
import { TakeNoteBar } from '../components/TakeNoteBar';
import { HeaderActions } from '../components/HeaderActions';
import { useAppSettings } from '../context/AppSettingsContext';
import { cn } from '../utils/cn';

const PAGE_SIZE = 50;

const MOODS = [
  { value: 'happy',     label: '😊 Happy' },
  { value: 'neutral',   label: '😐 Neutral' },
  { value: 'sad',       label: '😢 Sad' },
  { value: 'stressed',  label: '⚡ Stressed' },
  { value: 'motivated', label: '🚀 Motivated' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

// ─── Calendar Popover ───────────────────────────────────────────────────
function CalendarPopover({ startDate, endDate, onApply, onClose }) {
  const [from, setFrom] = useState(startDate || '');
  const [to,   setTo]   = useState(endDate   || '');

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-card-bg/95 backdrop-blur-xl border border-border/50 rounded-[1.25rem] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.15em]">Date Range</span>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-xs text-text-secondary mb-1.5 block">From</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="w-full bg-input-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
        <div>
          <label className="text-xs text-text-secondary mb-1.5 block">To</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            className="w-full bg-input-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { onApply('', ''); onClose(); }}
          className="flex-1 py-2 rounded-xl text-xs font-medium text-text-secondary hover:bg-input-bg transition-colors border border-border"
        >
          Clear
        </button>
        <button
          onClick={() => { onApply(from, to); onClose(); }}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-brand text-white hover:bg-brand-hover transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// ─── Filter Popover ──────────────────────────────────────────────────────
function FilterPopover({ selectedMoods, sortOrder, onApply, onClose }) {
  const [moods, setMoods] = useState(selectedMoods);
  const [sort,  setSort]  = useState(sortOrder);

  const toggleMood = (v) =>
    setMoods(prev => prev.includes(v) ? prev.filter(m => m !== v) : [...prev, v]);

  return (
    <div className="absolute right-0 top-full mt-2 w-72 bg-card-bg/95 backdrop-blur-xl border border-border/50 rounded-[1.25rem] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.15em]">Filters</span>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Mood */}
      <div className="mb-4">
        <p className="text-xs text-text-secondary mb-2 font-medium">Mood</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => toggleMood(value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                moods.includes(value)
                  ? 'bg-brand/20 text-brand border-brand/40'
                  : 'bg-input-bg text-text-secondary border-border hover:border-brand/20'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className="mb-4">
        <p className="text-xs text-text-secondary mb-2 font-medium">Sort Order</p>
        <div className="flex gap-2">
          {SORT_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSort(value)}
              className={cn(
                'flex-1 py-2 rounded-xl text-xs font-medium transition-all border',
                sort === value
                  ? 'bg-brand/20 text-brand border-brand/40'
                  : 'bg-input-bg text-text-secondary border-border hover:border-brand/20'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { onApply([], 'newest'); onClose(); }}
          className="flex-1 py-2 rounded-xl text-xs font-medium text-text-secondary hover:bg-input-bg transition-colors border border-border"
        >
          Clear All
        </button>
        <button
          onClick={() => { onApply(moods, sort); onClose(); }}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-brand text-white hover:bg-brand-hover transition-colors"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

// ─── Main Archive Page ───────────────────────────────────────────────────
export function Archive() {
  const { isFullWidth } = useAppSettings();
  const [journals, setJournals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);

  // Filter state
  const [startDate, setStartDate]     = useState('');
  const [endDate,   setEndDate]       = useState('');
  const [moodFilter, setMoodFilter]   = useState([]);
  const [sortOrder, setSortOrder]     = useState('newest');

  // Popover state
  const [showCalendar, setShowCalendar] = useState(false);
  const [showFilter,   setShowFilter]   = useState(false);
  const calRef = useRef(null);
  const filRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    const handler = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) setShowCalendar(false);
      if (filRef.current && !filRef.current.contains(e.target)) setShowFilter(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch all journals
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required. Please log in.');

      const first = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/journal/user?page=0&size=${PAGE_SIZE}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const firstData = await first.json().catch(() => ({}));
      if (!first.ok || firstData.success === false)
        throw new Error(firstData.message || 'Failed to fetch journals');

      const pageData = firstData.data || {};
      const totalPages = pageData.totalPages ?? 1;
      let content = pageData.content || [];
      setTotalElements(pageData.totalElements ?? content.length);

      if (totalPages > 1) {
        const rest = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, i) =>
            fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/user?page=${i + 1}&size=${PAGE_SIZE}`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then(r => r.json()).then(d => d.data?.content || [])
          )
        );
        content = [...content, ...rest.flat()];
      }

      setJournals(content.map((entry, idx) => ({
        id: entry.id || idx,
        date: entry.date
          ? new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
          : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        rawDate: entry.date || new Date().toISOString().slice(0, 10),
        preview: entry.whatDidIDo || entry.bestMoment || 'Empty entry...',
        mood: entry.feeling || 'neutral',
        fullData: entry,
      })));
    } catch (err) {
      setError(err.message || 'Cannot fetch journals. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Apply all filters
  const processedJournals = (() => {
    let list = [...journals];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(j => {
        if (j.preview.toLowerCase().includes(q)) return true;
        if (j.date.toLowerCase().includes(q)) return true;
        if (j.mood.toLowerCase().includes(q)) return true;
        const d = j.fullData;
        return d && (
          d.whatDidIDo?.toLowerCase().includes(q) ||
          d.bestMoment?.toLowerCase().includes(q) ||
          d.whatILearned?.toLowerCase().includes(q) ||
          d.whatIDoForGoal?.toLowerCase().includes(q) ||
          d.gratitude?.some(g => g.toLowerCase().includes(q)) ||
          d.shortTermGoal?.some(g => g.toLowerCase().includes(q)) ||
          d.longTermGoal?.some(g => g.toLowerCase().includes(q))
        );
      });
    }

    // Date range
    if (startDate) list = list.filter(j => j.rawDate >= startDate);
    if (endDate)   list = list.filter(j => j.rawDate <= endDate);

    // Mood
    if (moodFilter.length > 0) list = list.filter(j => moodFilter.includes(j.mood));

    // Sort
    list.sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.rawDate) - new Date(a.rawDate)
        : new Date(a.rawDate) - new Date(b.rawDate)
    );

    return list;
  })();

  const activeFilterCount =
    (startDate || endDate ? 1 : 0) + moodFilter.length + (sortOrder !== 'newest' ? 1 : 0);

  const clearAllFilters = () => {
    setStartDate(''); setEndDate('');
    setMoodFilter([]); setSortOrder('newest');
    setSearchQuery('');
  };

  return (
    <div className={cn(
      'mx-auto px-6 py-12 md:py-20 page-enter',
      isFullWidth ? 'max-w-[120rem] md:px-16 lg:px-24' : 'max-w-5xl'
    )}>
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
        <div>
          <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-3">The Archive</h1>
          <p className="text-text-secondary text-base">
            Revisit the path you've walked.
            {totalElements > 0 && (
              <span className="ml-2 text-text-tertiary text-sm">
                — {totalElements} {totalElements === 1 ? 'entry' : 'entries'}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
          {/* Search */}
          <div className="relative flex-1 md:w-56">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search archive..."
              className="w-full bg-input-bg border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand/20 focus:outline-none transition-all placeholder:text-text-tertiary"
            />
          </div>

          {/* Calendar Button */}
          <div className="relative" ref={calRef}>
            <button
              onClick={() => { setShowCalendar(v => !v); setShowFilter(false); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm transition-all border',
                (startDate || endDate)
                  ? 'bg-brand/10 text-brand border-brand/30'
                  : 'text-text-secondary border-border hover:text-text-primary hover:border-text-secondary/30'
              )}
              title="Filter by date"
            >
              <Calendar size={16} />
              {(startDate || endDate) && <span className="text-xs font-semibold">Date</span>}
            </button>
            {showCalendar && (
              <CalendarPopover
                startDate={startDate}
                endDate={endDate}
                onApply={(s, e) => { setStartDate(s); setEndDate(e); }}
                onClose={() => setShowCalendar(false)}
              />
            )}
          </div>

          {/* Filter Button */}
          <div className="relative" ref={filRef}>
            <button
              onClick={() => { setShowFilter(v => !v); setShowCalendar(false); }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2.5 rounded-full text-sm transition-all border',
                activeFilterCount > 0
                  ? 'bg-brand/10 text-brand border-brand/30'
                  : 'text-text-secondary border-border hover:text-text-primary hover:border-text-secondary/30'
              )}
              title="Filter & Sort"
            >
              <Filter size={16} />
              {activeFilterCount > 0 && (
                <span className="text-xs font-bold bg-brand text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {showFilter && (
              <FilterPopover
                selectedMoods={moodFilter}
                sortOrder={sortOrder}
                onApply={(m, s) => { setMoodFilter(m); setSortOrder(s); }}
                onClose={() => setShowFilter(false)}
              />
            )}
          </div>

          <div className="w-px h-5 bg-border mx-1 hidden md:block" />
          <HeaderActions className="ml-1" />
        </div>
      </header>

      {/* Active Filter Badges */}
      {(activeFilterCount > 0 || searchQuery) && (
        <div className="flex flex-wrap items-center gap-2 mb-8 -mt-8">
          {searchQuery && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-input-bg border border-border rounded-full text-xs text-text-secondary">
              🔍 "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-text-primary"><X size={11} /></button>
            </span>
          )}
          {(startDate || endDate) && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-xs text-brand">
              📅 {startDate || '…'} → {endDate || '…'}
              <button onClick={() => { setStartDate(''); setEndDate(''); }} className="hover:opacity-70"><X size={11} /></button>
            </span>
          )}
          {moodFilter.map(m => (
            <span key={m} className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-xs text-brand">
              {MOODS.find(x => x.value === m)?.label}
              <button onClick={() => setMoodFilter(prev => prev.filter(x => x !== m))} className="hover:opacity-70"><X size={11} /></button>
            </span>
          ))}
          {sortOrder !== 'newest' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full text-xs text-brand">
              ↑ Oldest First
              <button onClick={() => setSortOrder('newest')} className="hover:opacity-70"><X size={11} /></button>
            </span>
          )}
          <button onClick={clearAllFilters} className="text-xs text-text-tertiary hover:text-red-400 transition-colors underline underline-offset-2">
            Clear all
          </button>
        </div>
      )}

      <TakeNoteBar />

      {/* Journal Grid */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xs font-bold text-text-secondary tracking-widest uppercase">Your History</h2>
          {!loading && (
            <span className="text-xs text-text-tertiary">
              {processedJournals.length !== totalElements
                ? `${processedJournals.length} of ${totalElements} entries`
                : `${totalElements} ${totalElements === 1 ? 'entry' : 'entries'}`}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-text-tertiary">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading your journals...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p>{error}</p>
          </div>
        ) : journals.length === 0 ? (
          <div className="text-center py-20 text-text-tertiary">
            <p>No journals found. Take a note above, or create one for today!</p>
          </div>
        ) : processedJournals.length === 0 ? (
          <div className="text-center py-20 text-text-tertiary">
            <p className="mb-3">No journals match your current filters.</p>
            <button onClick={clearAllFilters} className="text-sm text-brand hover:underline">Clear all filters</button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {processedJournals.map((entry) => (
              <div key={entry.id} className="break-inside-avoid" onClick={() => setSelectedJournal(entry)}>
                <JournalCard {...entry} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <JournalModal
        journal={selectedJournal}
        onClose={() => setSelectedJournal(null)}
        onDelete={(id) => { setJournals(prev => prev.filter(j => j.id !== id)); setSelectedJournal(null); }}
        onUpdate={(updatedData) => {
          const mapped = {
            id: updatedData.id,
            date: updatedData.date
              ? new Date(updatedData.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
              : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
            rawDate: updatedData.date || new Date().toISOString().slice(0, 10),
            preview: updatedData.whatDidIDo || updatedData.bestMoment || 'Empty entry...',
            mood: updatedData.feeling || 'neutral',
            fullData: updatedData,
          };
          setJournals(prev => prev.map(j => j.id === updatedData.id ? mapped : j));
          setSelectedJournal(mapped);
        }}
      />

      {/* Footer Progress */}
      <div className="mt-16 pt-12 flex flex-col items-center border-t border-border/50 pb-20">
        <div className="w-1/3 bg-border h-1 rounded-full mb-4 overflow-hidden">
          <div
            className="bg-brand h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.round((totalElements / 365) * 100))}%` }}
          />
        </div>
        <p className="text-[10px] text-text-tertiary uppercase tracking-[0.1em]">
          {Math.min(100, Math.round((totalElements / 365) * 100))}% of your yearly goal reached
        </p>
      </div>
    </div>
  );
}
