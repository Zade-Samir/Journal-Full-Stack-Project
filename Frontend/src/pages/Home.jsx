import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, CheckCircle2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { TextArea } from '../components/TextArea';
import { InputField } from '../components/InputField';
import { EmotionSelector } from '../components/EmotionSelector';
import { Button } from '../components/Button';
import { GoalCard } from '../components/GoalCard';
import { HeaderActions } from '../components/HeaderActions';
import { useAppSettings } from '../context/AppSettingsContext';
import { cn } from '../utils/cn';

export function Home() {
  const navigate = useNavigate();
  
  const [whatDidIDo, setWhatDidIDo] = useState('');
  const [bestMoment, setBestMoment] = useState('');
  const [worstMoment, setWorstMoment] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [shortTermGoal, setShortTermGoal] = useState(['', '']);
  const [longTermGoal, setLongTermGoal] = useState(['', '']);
  const [activeGoalsList, setActiveGoalsList] = useState([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  
  const [whatIDoForGoal, setWhatIDoForGoal] = useState('');
  const [mood, setMood] = useState('neutral');
  const [feelingNote, setFeelingNote] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Server errors
  const [fieldErrors, setFieldErrors] = useState({}); // Local frontend box errors
  const [journalId, setJournalId] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const isInitialMount = useRef(true);

  const updateArray = (setter, array, index, value) => {
    const newArr = [...array];
    newArr[index] = value;
    setter(newArr);
  };

  const addToArray = (setter, array) => setter([...array, '']);

  const handleToggleGoal = (id) => {
    setSelectedGoalIds(prev => 
      prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
    );
  };

  const today = new Intl.DateTimeFormat('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  useEffect(() => {
    const fetchToday = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/today`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        const data = await response.json().catch(() => ({}));
        
        if (response.ok && data.success && data.data) {
          const entry = data.data;
          if (entry.id) setJournalId(entry.id);
          if (entry.whatDidIDo) setWhatDidIDo(entry.whatDidIDo);
          if (entry.bestMoment) setBestMoment(entry.bestMoment);
          if (entry.worstMoment) setWorstMoment(entry.worstMoment);
          if (entry.whatILearned) setWhatILearned(entry.whatILearned);
          
          if (entry.gratitude && entry.gratitude.length > 0) setGratitude(entry.gratitude);
          if (entry.shortTermGoal && entry.shortTermGoal.length > 0) setShortTermGoal(entry.shortTermGoal);
          if (entry.longTermGoal && entry.longTermGoal.length > 0) setLongTermGoal(entry.longTermGoal);
          if (entry.goalIds && entry.goalIds.length > 0) setSelectedGoalIds(entry.goalIds);
          
          if (entry.whatIDoForGoal) setWhatIDoForGoal(entry.whatIDoForGoal);
          if (entry.feeling) setMood(entry.feeling);
          if (entry.feelingNote) setFeelingNote(entry.feelingNote);
        }
      } catch (err) {
        console.error("Could not fetch today's journal", err);
      } finally {
        setTimeout(() => setIsDataLoaded(true), 500); // 500ms grace period for state updates
      }
    };

    const fetchActiveGoals = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/goals`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (res.ok && json.success) {
          setActiveGoalsList(json.data || []);
        }
      } catch (err) {
        console.error("Could not fetch goals", err);
      }
    };
    
    fetchToday();
    fetchActiveGoals();
  }, []);

  // Debounced Auto-Save
  useEffect(() => {
    if (!isDataLoaded) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const payload = {
      whatDidIDo, 
      bestMoment, 
      worstMoment, 
      whatILearned,
      gratitude: gratitude.filter(g => g.trim() !== ''),
      shortTermGoal: shortTermGoal.filter(g => g.trim() !== ''),
      longTermGoal: longTermGoal.filter(g => g.trim() !== ''),
      goalIds: selectedGoalIds,
      whatIDoForGoal, 
      feeling: mood, 
      feelingNote
    };

    // Ignore if completely empty
    const isEmpty = Object.values(payload).every(v => 
      (Array.isArray(v) ? v.length === 0 : !v || v.trim().length === 0)
    );
    if (isEmpty) return;

    setSaveStatus('saving');

    const timeoutId = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/auto-save`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
           const data = await response.json().catch(() => ({}));
           // Capture the ID returned by auto-save so future Save Entry uses PUT
           if (data?.data?.id && !journalId) {
             setJournalId(data.data.id);
           }
           setSaveStatus('saved');
        } else {
           setSaveStatus('error');
        }
      } catch (err) {
        setSaveStatus('error');
      }
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timeoutId);

  }, [whatDidIDo, bestMoment, worstMoment, whatILearned, gratitude, shortTermGoal, longTermGoal, whatIDoForGoal, mood, feelingNote, isDataLoaded, selectedGoalIds]);

  const handleSave = async () => {
    setError(null);
    setFieldErrors({});
    setLoading(true);

    // Front-end local validation checks against DTO expectations
    const newErrors = {};
    if (!whatDidIDo || whatDidIDo.trim().length < 5) newErrors.whatDidIDo = true;
    if (!bestMoment || bestMoment.trim().length === 0) newErrors.bestMoment = true;
    if (!whatILearned || whatILearned.trim().length === 0) newErrors.whatILearned = true;
    if (!whatIDoForGoal || whatIDoForGoal.trim().length === 0) newErrors.whatIDoForGoal = true;

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setLoading(false);
      return; // Stop processing and show red boxes
    }
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found. Please log in.");

      const payload = {
        whatDidIDo,
        bestMoment,
        worstMoment,
        whatILearned,
        gratitude: gratitude.filter(g => g.trim() !== ''),
        shortTermGoal: shortTermGoal.filter(g => g.trim() !== ''),
        longTermGoal: longTermGoal.filter(g => g.trim() !== ''),
        goalIds: selectedGoalIds,
        whatIDoForGoal,
        feeling: mood,
        feelingNote
      };

      let response;
      if (journalId) {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/${journalId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ ...payload, id: journalId })
        });
      } else {
        response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to create journal entry.");
      }

      navigate('/complete');
    } catch (err) {
      setError(err.message || "Cannot connect to server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const { isFullWidth } = useAppSettings();

  return (
    <div className={cn(
      "mx-auto px-6 py-12 md:py-20", 
      isFullWidth ? "max-w-[120rem] md:px-16 lg:px-24" : "max-w-3xl"
    )}>
      <header className="flex justify-between items-start mb-20">
        <div>
          <p className="text-brand text-xs font-bold tracking-widest uppercase mb-2">{today}</p>
          <h2 className="text-lg font-semibold text-text-primary block md:hidden">The Quiet Room</h2>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className={cn(
            "flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full transition-colors",
            saveStatus === 'saving' ? "bg-brand/10 text-brand" : 
            saveStatus === 'error' ? "bg-red-500/10 text-red-500" : "bg-input-bg text-text-tertiary"
          )}>
            {saveStatus === 'saving' && <Loader2 size={14} className="animate-spin" />}
            {saveStatus === 'saved' && <Cloud size={14} />}
            {saveStatus === 'error' && <AlertCircle size={14} />}
            <span className="hidden sm:inline">
              {saveStatus === 'saving' ? "Auto-saving..." : saveStatus === 'saved' ? "Saved" : "Offline"}
            </span>
          </div>
          <HeaderActions />
        </div>
      </header>

      <div className="space-y-20">
        
        {error && (
            <div className="p-3 mb-8 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-center text-red-500 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
        )}

        <section>
          <h2 className="text-2xl font-normal text-text-primary mb-6">What did I do today?</h2>
          <TextArea 
            placeholder="Describe your day... (min 5 characters)"
            value={whatDidIDo}
            onChange={(e) => {
              setWhatDidIDo(e.target.value);
              if (fieldErrors.whatDidIDo) setFieldErrors({ ...fieldErrors, whatDidIDo: false });
            }}
            className={cn(
              "min-h-[140px] text-lg placeholder:font-light transition-all",
              fieldErrors.whatDidIDo && "ring-2 ring-red-500/80 bg-red-500/5 rounded-2xl px-5 py-4 placeholder:text-red-400/70"
            )}
          />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Today's Best Moment</h3>
            <TextArea 
              placeholder="A spark of joy..." 
              value={bestMoment}
              onChange={(e) => {
                setBestMoment(e.target.value);
                if (fieldErrors.bestMoment) setFieldErrors({ ...fieldErrors, bestMoment: false });
              }}
              className={cn(
                "min-h-[80px] transition-all",
                fieldErrors.bestMoment && "ring-2 ring-red-500/80 bg-red-500/5 rounded-2xl px-5 py-3 placeholder:text-red-400/70"
              )} 
            />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Today's Worst Moment</h3>
            <TextArea 
              placeholder="A challenge faced..." 
              value={worstMoment}
              onChange={(e) => setWorstMoment(e.target.value)}
              className="min-h-[80px]" 
            />
          </div>
        </section>

        <section className="bg-input-bg/50 p-8 rounded-3xl">
          <h3 className="text-lg font-medium text-text-primary mb-4">What did I learn today?</h3>
          <InputField 
            placeholder="A new insight or realization..." 
            value={whatILearned}
            onChange={(e) => {
              setWhatILearned(e.target.value);
              if (fieldErrors.whatILearned) setFieldErrors({ ...fieldErrors, whatILearned: false });
            }}
            className={cn(
              "shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all",
              fieldErrors.whatILearned ? "ring-2 ring-red-500/80 bg-red-500/5 placeholder:text-red-400/70" : "bg-card-bg"
            )} 
          />
        </section>

        <section>
          <div className="space-y-6">
            {gratitude.map((val, i) => {
              const num = i + 1;
              return (
                <div key={i} className="flex items-start gap-6 group">
                  <span className="text-brand/40 group-focus-within:text-brand font-semibold text-sm mt-2 transition-colors">
                    {num < 10 ? `0${num}` : num}
                  </span>
                  <InputField 
                    placeholder="I am thankful for..." 
                    value={val}
                    onChange={(e) => updateArray(setGratitude, gratitude, i, e.target.value)}
                    className="bg-transparent border-b border-border rounded-none px-0 py-2 focus:ring-0 focus:border-brand shadow-none min-h-[40px] leading-relaxed" 
                  />
                </div>
              );
            })}
          </div>
          <button 
            onClick={() => addToArray(setGratitude, gratitude)}
            className="mt-6 flex items-center gap-2 text-sm text-text-tertiary hover:text-brand transition-colors font-medium border border-dashed border-border rounded-xl px-4 py-2 hover:border-brand hover:bg-brand/5"
          >
            <Plus size={16} /> Add another
          </button>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GoalCard title="Short-term goals">
            <div className="space-y-2">
              {activeGoalsList.filter(g => g.type === 'SHORT_TERM' && g.status !== 'DONE').length === 0 ? (
                <p className="text-xs text-text-tertiary italic">No active short-term goals. Set some in the Goals Dashboard.</p>
              ) : (
                activeGoalsList.filter(g => g.type === 'SHORT_TERM' && g.status !== 'DONE').map(goal => (
                  <label key={goal.id} className="flex items-center gap-3 p-2.5 bg-input-bg/40 border border-border/40 hover:border-brand/30 rounded-xl cursor-pointer transition-all">
                    <input 
                      type="checkbox"
                      checked={selectedGoalIds.includes(goal.id)}
                      onChange={() => handleToggleGoal(goal.id)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span className={cn("text-xs font-medium text-text-secondary", selectedGoalIds.includes(goal.id) && "text-brand font-bold")}>{goal.title}</span>
                  </label>
                ))
              )}
            </div>
          </GoalCard>
          <GoalCard title="Long-term goals">
            <div className="space-y-2">
              {activeGoalsList.filter(g => g.type === 'LONG_TERM' && g.status !== 'DONE').length === 0 ? (
                <p className="text-xs text-text-tertiary italic">No active long-term goals. Set some in the Goals Dashboard.</p>
              ) : (
                activeGoalsList.filter(g => g.type === 'LONG_TERM' && g.status !== 'DONE').map(goal => (
                  <label key={goal.id} className="flex items-center gap-3 p-2.5 bg-input-bg/40 border border-border/40 hover:border-brand/30 rounded-xl cursor-pointer transition-all">
                    <input 
                      type="checkbox"
                      checked={selectedGoalIds.includes(goal.id)}
                      onChange={() => handleToggleGoal(goal.id)}
                      className="rounded border-border text-brand focus:ring-brand"
                    />
                    <span className={cn("text-xs font-medium text-text-secondary", selectedGoalIds.includes(goal.id) && "text-brand font-bold")}>{goal.title}</span>
                  </label>
                ))
              )}
            </div>
          </GoalCard>
        </section>

        <section>
          <h3 className="text-lg font-medium text-text-primary mb-4">What did I do for my goals today?</h3>
          <div className={cn(
            "pl-4 border-l-2 transition-all",
            fieldErrors.whatIDoForGoal ? "border-red-500/80 bg-red-500/5 rounded-r-xl py-3" : "border-border focus-within:border-brand/40"
          )}>
            <TextArea 
              placeholder="Every small step counts..." 
              value={whatIDoForGoal}
              onChange={(e) => {
                setWhatIDoForGoal(e.target.value);
                if (fieldErrors.whatIDoForGoal) setFieldErrors({ ...fieldErrors, whatIDoForGoal: false });
              }}
              className={cn(
                "min-h-[60px]",
                fieldErrors.whatIDoForGoal && "placeholder:text-red-400/70"
              )} 
            />
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium text-text-primary mb-6">How do I feel right now?</h3>
          <EmotionSelector selected={mood} onSelect={setMood} className="mb-6" />
          <InputField 
            placeholder="Briefly describe your mood..." 
            value={feelingNote}
            onChange={(e) => setFeelingNote(e.target.value)}
            className="bg-transparent border-b border-border rounded-none px-0 py-2 focus:ring-0 focus:border-brand text-sm shadow-none w-full md:w-1/2" 
          />
        </section>

        <div className="pt-12 pb-24 flex justify-center">
          <Button 
            size="lg" 
            disabled={loading}
            className="px-10 py-3.5 rounded-full shadow-[0_4px_14px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2" 
            onClick={handleSave}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
            {loading ? "Saving Entry..." : "Save Entry"}
          </Button>
        </div>
      </div>
    </div>
  );
}
