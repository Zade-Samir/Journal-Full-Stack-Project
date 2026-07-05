import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Cloud, MoreVertical, Edit2, Trash2, CheckCircle2, Loader2, AlertCircle, Plus, Star } from 'lucide-react';
import { TextArea } from './TextArea';
import { InputField } from './InputField';
import { EmotionSelector } from './EmotionSelector';
import { GoalCard } from './GoalCard';
import { Button } from './Button';
import { cn } from '../utils/cn';

export function JournalModal({ journal, onClose, onDelete, onUpdate, startInEditMode = false }) {
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const isInitialMount = useRef(true);

  // Edit States
  const [whatDidIDo, setWhatDidIDo] = useState('');
  const [bestMoment, setBestMoment] = useState('');
  const [worstMoment, setWorstMoment] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  const [gratitude, setGratitude] = useState(['']);
  const [shortTermGoal, setShortTermGoal] = useState(['']);
  const [longTermGoal, setLongTermGoal] = useState(['']);
  const [whatIDoForGoal, setWhatIDoForGoal] = useState('');
  const [mood, setMood] = useState('neutral');
  const [feelingNote, setFeelingNote] = useState('');
  const [activeGoalsList, setActiveGoalsList] = useState([]);
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);

  const journalIdProp = journal?.fullData?.id || journal?.id;

  // Re-initialize state when journal changes (using exact ID to prevent auto-save from resetting the UI)
  useEffect(() => {
    setIsEditing(false);
    setIsMenuOpen(false);
    setShowDeleteConfirm(false);
    setError(null);
    
    if (journal && journal.fullData) {
      const { fullData } = journal;
      setWhatDidIDo(fullData.whatDidIDo || '');
      setBestMoment(fullData.bestMoment || '');
      setWorstMoment(fullData.worstMoment || '');
      setWhatILearned(fullData.whatILearned || '');
      setGratitude(fullData.gratitude?.length ? fullData.gratitude : ['']);
      setShortTermGoal(fullData.shortTermGoal?.length ? fullData.shortTermGoal : ['']);
      setLongTermGoal(fullData.longTermGoal?.length ? fullData.longTermGoal : ['']);
      setSelectedGoalIds(fullData.goalIds || []);
      setWhatIDoForGoal(fullData.whatIDoForGoal || '');
      setMood(journal.mood || 'neutral');
      setFeelingNote(fullData.feelingNote || '');
    }

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
        console.error("Could not fetch goals in modal", err);
      }
    };
    fetchActiveGoals();
  }, [journalIdProp]);

  // Debounced Editor Auto-Save using PUT
  useEffect(() => {
    if (!isEditing) return; // Only auto-save in edit mode
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }
    
    // Front-end local validation checks against DTO expectations
    if (!whatDidIDo || whatDidIDo.trim().length < 5) return;
    if (!bestMoment || bestMoment.trim().length === 0) return;
    if (!whatILearned || whatILearned.trim().length === 0) return;
    if (!whatIDoForGoal || whatIDoForGoal.trim().length === 0) return;

    if (!journal || !journal.fullData) return;
    const id = journal.fullData.id || journal.id;
    if (!id && id !== 0) return;

    setSaveStatus('saving');

    const timeoutId = setTimeout(async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = {
          whatDidIDo, bestMoment, worstMoment, whatILearned,
          gratitude: gratitude.filter(g => g.trim() !== ''),
          shortTermGoal: shortTermGoal.filter(g => g.trim() !== ''),
          longTermGoal: longTermGoal.filter(g => g.trim() !== ''),
          goalIds: selectedGoalIds,
          whatIDoForGoal, feeling: mood, feelingNote
        };

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/${id}`, {
          method: 'PUT',
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
          },
          body: JSON.stringify({ ...payload, id })
        });
        
        if (response.ok) {
           setSaveStatus('saved');
           if (onUpdate) onUpdate({ ...payload, id });
         } else {
            setSaveStatus('error');
         }
       } catch (err) {
         setSaveStatus('error');
       }
     }, 2000); // 2 second debounce
 
     return () => clearTimeout(timeoutId);
 
   }, [isEditing, whatDidIDo, bestMoment, worstMoment, whatILearned, gratitude, shortTermGoal, longTermGoal, whatIDoForGoal, mood, feelingNote, selectedGoalIds]);
 
   if (!journal || !journal.fullData) return null;
 
   const id = journal.fullData.id || journal.id;
   const isStarred = journal.fullData?.starred || false;
 
   // Calculate word count & reading time
   const gratitudeList = (journal.fullData?.gratitude || []).filter(g => g?.trim());
   const shortGoalsList = (journal.fullData?.shortTermGoal || []).filter(g => g?.trim());
   const longGoalsList  = (journal.fullData?.longTermGoal  || []).filter(g => g?.trim());
 
   const texts = [
     journal.fullData?.whatDidIDo,
     journal.fullData?.bestMoment,
     journal.fullData?.worstMoment,
     journal.fullData?.whatILearned,
     journal.fullData?.whatIDoForGoal,
     journal.fullData?.feelingNote,
     ...gratitudeList,
     ...shortGoalsList,
     ...longGoalsList
   ];
   const combinedText = texts.filter(t => typeof t === 'string' && t.trim()).join(' ');
   const words = combinedText.trim().split(/\s+/).filter(w => w.length > 0);
   const wordCount = words.length;
   const readingTime = Math.max(1, Math.round(wordCount / 200));
 
   const handleToggleStar = async () => {
     try {
       const token = localStorage.getItem('token');
       const newStarred = !isStarred;
       const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/${id}/star?starred=${newStarred}`, {
         method: 'PATCH',
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       const json = await res.json();
       if (res.ok && json.success) {
         if (onUpdate) {
           onUpdate({ ...journal.fullData, starred: newStarred });
         }
       }
     } catch (err) {
       console.error("Error toggling star in modal", err);
     }
   };
 
   const updateArray = (setter, array, index, value) => {
     const newArr = [...array];
     newArr[index] = value;
     setter(newArr);
   };
   const addToArray = (setter, array) => setter([...array, '']);

   const handleToggleGoal = (gid) => {
     setSelectedGoalIds(prev => 
       prev.includes(gid) ? prev.filter(x => x !== gid) : [...prev, gid]
     );
   };

  const confirmDelete = () => {
    setIsMenuOpen(false);
    
    if (!id && id !== 0) {
      setError("This journal is missing an ID. Your backend must be rebuilt to include 'id' in JournalRequestDTO.");
      return;
    }
    
    setShowDeleteConfirm(true);
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required.");

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const data = await response.json().catch(() => ({}));
      if (response.ok || data.success) {
        if (onDelete) onDelete(id);
      } else {
         throw new Error(data.message || "Failed to delete");
      }
    } catch (e) {
      setError(e.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!id && id !== 0) {
      setError("This journal is missing an ID. Your backend must be rebuilt to include 'id' in JournalRequestDTO.");
      return;
    }
    
    // Front-end local validation checks against DTO expectations
    if (!whatDidIDo || whatDidIDo.trim().length < 5) return setError("What did I do today is required (min 5 chars).");
    if (!bestMoment || bestMoment.trim().length === 0) return setError("Best moment is required.");
    if (!whatILearned || whatILearned.trim().length === 0) return setError("What I learned is required.");
    if (!whatIDoForGoal || whatIDoForGoal.trim().length === 0) return setError("Work for goals is required.");

    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication required.");

      const payload = {
        id, // Send the ID back so mapping works
        whatDidIDo, 
        bestMoment, 
        worstMoment, 
        whatILearned,
        gratitude: gratitude.filter(g => g.trim() !== ''),
        shortTermGoal: shortTermGoal.filter(g => g.trim() !== ''),
        longTermGoal: longTermGoal.filter(g => g.trim() !== ''),
        whatIDoForGoal, 
        feeling: mood, 
        feelingNote
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/${id}`, {
        method: 'PUT',
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Failed to update");
      }

      setIsEditing(false);
      if (onUpdate) setTimeout(() => onUpdate(payload), 300);
      
    } catch(e) {
      setError(e.message || "Network Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 backdrop-blur-md", isEditing ? "p-0 bg-bg-base" : "p-0 md:p-6 bg-black/40")} onClick={() => !isEditing && onClose()}>
      <div 
        className={cn(
          "bg-bg-base w-full shadow-2xl relative overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-300 no-scrollbar flex flex-col transition-all",
          isEditing ? "h-screen md:max-w-none md:rounded-none border-none" : "h-full md:max-w-[70rem] md:h-[90vh] md:rounded-[2rem] border border-border"
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-bg-base/90 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between z-50 shrink-0">
          <div>
            <p className="text-brand text-xs font-bold tracking-widest uppercase mb-1">
              {journal.date} {!isEditing && <span className="text-text-tertiary font-normal text-[10px] ml-2">• {wordCount} words • ~{readingTime} min read</span>}
            </p>
            <h2 className="text-lg font-semibold text-text-primary hidden md:block">
               {isEditing ? "Editing Journal Entry" : "Journal Entry Archive"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className={cn(
               "flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-full border border-border/50 transition-colors", 
               !isEditing ? "bg-input-bg text-text-tertiary" : 
               saveStatus === 'saving' ? "bg-brand/10 text-brand" : 
               saveStatus === 'error' ? "bg-red-500/10 text-red-500" : "bg-brand/10 text-brand outline outline-1 outline-brand"
            )}>
              {!isEditing && <Cloud size={14} />}
              {isEditing && saveStatus === 'saving' && <Loader2 size={14} className="animate-spin" />}
              {isEditing && saveStatus === 'saved' && <Edit2 size={14} />}
              {isEditing && saveStatus === 'error' && <AlertCircle size={14} />}
              <span className="hidden sm:inline">
                 {!isEditing ? "Read Only" : saveStatus === 'saving' ? "Auto-saving..." : saveStatus === 'saved' ? "Edit Mode" : "Offline"}
              </span>
            </div>

            {/* Star Toggle Button */}
            {!isEditing && (
              <button
                onClick={handleToggleStar}
                className={cn(
                  "p-2 rounded-full transition-all border border-border/50 flex shrink-0 hover:bg-black/5 dark:hover:bg-white/5",
                  isStarred ? "text-amber-400 bg-amber-400/5 border-amber-400/20" : "text-text-tertiary bg-input-bg hover:text-text-secondary"
                )}
                title={isStarred ? "Unstar Entry" : "Star Entry"}
              >
                <Star size={16} fill={isStarred ? "currentColor" : "none"} />
              </button>
            )}
            
            {/* 3-Dots Menu Map */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 text-text-tertiary hover:text-text-primary bg-input-bg hover:bg-black/5 rounded-full transition-colors border border-border/50 flex shrink-0"
              >
                <MoreVertical size={18} />
              </button>
              
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-card-bg border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1 animate-in slide-in-from-top-2">
                    {!isEditing && (
                      <button 
                        onClick={() => { setIsEditing(true); setIsMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand/10 hover:text-brand transition flex items-center gap-2"
                      >
                        <Edit2 size={14} /> Edit Journal
                      </button>
                    )}
                    <button 
                      onClick={confirmDelete}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition flex items-center gap-2"
                    >
                      {loading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} 
                      Delete Journal
                    </button>
                  </div>
                </>
              )}
            </div>

            <button onClick={onClose} disabled={loading} className="p-2 ml-1 text-text-tertiary hover:text-text-primary bg-input-bg hover:bg-black/5 rounded-full transition-colors border border-border/50 flex shrink-0 disabled:opacity-50">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content Body */}
        <div className="px-6 py-12 flex-1 max-w-3xl mx-auto w-full relative">
          
          {error && (
            <div className="p-4 mb-8 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 text-red-500 text-sm mx-auto shadow-sm animate-in fade-in">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          <div className={cn("space-y-20 transition-all duration-300", !isEditing && "opacity-80")}>
            <section>
              <h2 className="text-2xl font-normal text-text-primary mb-6 cursor-default">What did I do today?</h2>
              <TextArea 
                readOnly={!isEditing}
                value={whatDidIDo}
                onChange={e => setWhatDidIDo(e.target.value)}
                className={cn("min-h-[140px] text-lg", !isEditing && "pointer-events-none")}
              />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 cursor-default">Today's Best Moment</h3>
                <TextArea 
                  readOnly={!isEditing}
                  value={bestMoment}
                  onChange={e => setBestMoment(e.target.value)}
                  className={cn("min-h-[80px]", !isEditing && "pointer-events-none")} 
                />
              </div>
              <div>
                <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 cursor-default">Today's Worst Moment</h3>
                <TextArea 
                  readOnly={!isEditing}
                  value={worstMoment}
                  onChange={e => setWorstMoment(e.target.value)}
                  className={cn("min-h-[80px]", !isEditing && "pointer-events-none")} 
                />
              </div>
            </section>

            <section className={cn("p-8 rounded-3xl transition-colors", isEditing ? "bg-card-bg border border-brand/20 shadow-sm" : "bg-input-bg/50")}>
              <h3 className="text-lg font-medium text-text-primary mb-4 cursor-default">What did I learn today?</h3>
              <InputField 
                readOnly={!isEditing}
                value={whatILearned}
                onChange={e => setWhatILearned(e.target.value)}
                className={cn(isEditing && "bg-bg-base border border-border focus:border-brand/40 shadow-sm", !isEditing && "bg-card-bg shadow-[0_2px_8px_rgba(0,0,0,0.04)] pointer-events-none")} 
              />
            </section>

            <section>
              <div className="space-y-6">
                {gratitude.map((val, i) => {
                  const num = i + 1;
                  return (
                    <div key={i} className="flex items-start gap-6 group">
                      <span className="text-brand/40 font-semibold text-sm mt-2 transition-colors cursor-default">
                        {num < 10 ? `0${num}` : num}
                      </span>
                      <InputField 
                        readOnly={!isEditing}
                        value={val}
                        onChange={e => updateArray(setGratitude, gratitude, i, e.target.value)}
                        className={cn("bg-transparent border-b border-border rounded-none px-0 py-2 shadow-none min-h-[40px] leading-relaxed transition-all", !isEditing ? "pointer-events-none" : "focus:border-brand focus:ring-0")} 
                      />
                    </div>
                  );
                })}
              </div>
              {isEditing && (
                <button onClick={() => addToArray(setGratitude, gratitude)} className="mt-6 flex items-center gap-2 text-sm text-text-tertiary hover:text-brand transition-colors font-medium border border-dashed border-border rounded-xl px-4 py-2 hover:border-brand hover:bg-brand/5 animate-in fade-in">
                  <Plus size={16} /> Add another
                </button>
              )}
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GoalCard title="Short-term goals">
                <div className="space-y-2">
                  {isEditing ? (
                    activeGoalsList.filter(g => g.type === 'SHORT_TERM' && g.status !== 'DONE').length === 0 ? (
                      <p className="text-xs text-text-tertiary italic">No active short-term goals. Set some in the Goals Dashboard.</p>
                    ) : (
                      activeGoalsList.filter(g => g.type === 'SHORT_TERM' && g.status !== 'DONE').map(goal => (
                        <label key={goal.id} className="flex items-center gap-3 p-2 bg-input-bg/40 border border-border/40 hover:border-brand/35 rounded-xl cursor-pointer transition-all">
                          <input 
                            type="checkbox"
                            checked={selectedGoalIds.includes(goal.id)}
                            onChange={() => handleToggleGoal(goal.id)}
                            className="rounded border-border text-brand focus:ring-brand"
                          />
                          <span className={cn("text-xs font-medium text-text-secondary", selectedGoalIds.includes(goal.id) && "text-brand font-bold")}>{goal.title}</span>
                        </label>
                      ))
                    )
                  ) : (
                    (journal?.fullData?.goals || []).filter(g => g.type === 'SHORT_TERM').length === 0 ? (
                      <p className="text-xs text-text-tertiary italic">No short-term goals linked.</p>
                    ) : (
                      (journal?.fullData?.goals || []).filter(g => g.type === 'SHORT_TERM').map(goal => (
                        <div key={goal.id} className="flex items-center gap-2.5 p-2 bg-input-bg/30 border border-border/40 rounded-xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                          <span className="text-xs text-text-secondary font-medium">{goal.title}</span>
                        </div>
                      ))
                    )
                  )}
                </div>
              </GoalCard>
              <GoalCard title="Long-term goals">
                <div className="space-y-2">
                  {isEditing ? (
                    activeGoalsList.filter(g => g.type === 'LONG_TERM' && g.status !== 'DONE').length === 0 ? (
                      <p className="text-xs text-text-tertiary italic">No active long-term goals. Set some in the Goals Dashboard.</p>
                    ) : (
                      activeGoalsList.filter(g => g.type === 'LONG_TERM' && g.status !== 'DONE').map(goal => (
                        <label key={goal.id} className="flex items-center gap-3 p-2 bg-input-bg/40 border border-border/40 hover:border-brand/35 rounded-xl cursor-pointer transition-all">
                          <input 
                            type="checkbox"
                            checked={selectedGoalIds.includes(goal.id)}
                            onChange={() => handleToggleGoal(goal.id)}
                            className="rounded border-border text-brand focus:ring-brand"
                          />
                          <span className={cn("text-xs font-medium text-text-secondary", selectedGoalIds.includes(goal.id) && "text-brand font-bold")}>{goal.title}</span>
                        </label>
                      ))
                    )
                  ) : (
                    (journal?.fullData?.goals || []).filter(g => g.type === 'LONG_TERM').length === 0 ? (
                      <p className="text-xs text-text-tertiary italic">No long-term goals linked.</p>
                    ) : (
                      (journal?.fullData?.goals || []).filter(g => g.type === 'LONG_TERM').map(goal => (
                        <div key={goal.id} className="flex items-center gap-2.5 p-2 bg-input-bg/30 border border-border/40 rounded-xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                          <span className="text-xs text-text-secondary font-medium">{goal.title}</span>
                        </div>
                      ))
                    )
                  )}
                </div>
              </GoalCard>
            </section>

            <section>
              <h3 className="text-lg font-medium text-text-primary mb-4 cursor-default">What did I do for my goals today?</h3>
              <div className={cn("pl-4 border-l-2 transition-colors", isEditing ? "border-brand/40" : "border-border")}>
                <TextArea 
                  readOnly={!isEditing}
                  value={whatIDoForGoal}
                  onChange={e => setWhatIDoForGoal(e.target.value)}
                  className={cn("min-h-[60px]", !isEditing && "pointer-events-none")} 
                />
              </div>
            </section>

            <section className="pb-8">
              <h3 className="text-lg font-medium text-text-primary mb-6 cursor-default">How do I feel right now?</h3>
              <div className={cn(!isEditing && "pointer-events-none")}>
                <EmotionSelector selected={mood} onSelect={isEditing ? setMood : () => {}} className="mb-6" />
              </div>
              {(isEditing || feelingNote) && (
                 <InputField 
                   readOnly={!isEditing}
                   value={feelingNote}
                   onChange={e => setFeelingNote(e.target.value)}
                   placeholder="Briefly describe your mood..."
                   className={cn("bg-transparent border-b border-border rounded-none px-0 py-2 text-sm shadow-none w-full md:w-1/2 transition-colors", !isEditing ? "pointer-events-none" : "focus:ring-0 focus:border-brand")} 
                 />
              )}
            </section>

            {isEditing && (
              <div className="pt-6 pb-24 flex justify-center animate-in slide-in-from-bottom-4">
                <Button 
                  size="lg" 
                  disabled={loading}
                  className="px-10 py-3.5 rounded-full shadow-[0_4px_14px_rgba(59,130,246,0.25)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2" 
                  onClick={handleUpdate}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  {loading ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-card-bg border border-border w-full max-w-sm rounded-[2rem] p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-5 mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl text-center font-semibold text-text-primary mb-2">Delete Journal?</h3>
            <p className="text-center text-text-secondary text-sm mb-8 leading-relaxed">
              This action cannot be undone. Are you sure you want to permanently destroy this journal entry?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-3 rounded-full text-sm font-medium text-text-primary bg-input-bg hover:bg-black/5 transition-colors border border-border/50"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 px-4 py-3 rounded-full text-sm font-medium text-white bg-red-500 hover:bg-red-600 shadow-[0_4px_14px_rgba(239,68,68,0.25)] transition-all flex justify-center items-center gap-2"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
