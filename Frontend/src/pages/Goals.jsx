import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Trash2, Edit2, Calendar, ChevronRight, CheckCircle2, 
  Circle, Loader2, AlertCircle, CalendarRange, Clock, Target, ArrowLeft, BookOpen 
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { cn } from '../utils/cn';
import { Button } from '../components/Button';
import { InputField } from '../components/InputField';
import { HeaderActions } from '../components/HeaderActions';
import { useAppSettings } from '../context/AppSettingsContext';
import { JournalModal } from '../components/JournalModal';

export function Goals() {
  const { isFullWidth } = useAppSettings();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals / Detail Drawer
  const [isAdding, setIsAdding] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [linkedJournals, setLinkedJournals] = useState([]);
  const [loadingJournals, setLoadingJournals] = useState(false);
  const [activeJournal, setActiveJournal] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [status, setStatus] = useState('NOT_STARTED');
  const [type, setType] = useState('SHORT_TERM');
  const [formError, setFormError] = useState('');

  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authorization required. Please log in.');

      const response = await fetch(`${API_BASE_URL}/journal/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Failed to fetch goals');
      }
      setGoals(data.data || []);
    } catch (err) {
      setError(err.message || 'Error loading goals.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const fetchLinkedJournals = async (goalId) => {
    try {
      setLoadingJournals(true);
      setLinkedJournals([]);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/journal/goals/${goalId}/journals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setLinkedJournals(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching linked journals:', err);
    } finally {
      setLoadingJournals(false);
    }
  };

  const handleGoalClick = (goal) => {
    setSelectedGoal(goal);
    fetchLinkedJournals(goal.id);
  };

  const resetForm = () => {
    setTitle('');
    setTargetDate('');
    setStatus('NOT_STARTED');
    setType('SHORT_TERM');
    setFormError('');
    setEditingGoal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!title.trim()) {
      setFormError('Goal title is required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not logged in');

      const payload = {
        title,
        targetDate: targetDate || null,
        status,
        type
      };

      const url = editingGoal ? `${API_BASE_URL}/journal/goals/${editingGoal.id}` : `${API_BASE_URL}/journal/goals`;
      const method = editingGoal ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Error saving goal');
      }

      setIsAdding(false);
      resetForm();
      fetchGoals();
      // If we are currently viewing details of this goal, update selectedGoal
      if (selectedGoal && editingGoal && selectedGoal.id === editingGoal.id) {
        setSelectedGoal(data.data);
      }
    } catch (err) {
      setFormError(err.message || 'Error saving goal');
    }
  };

  const handleEditInit = (goal, e) => {
    e.stopPropagation();
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetDate(goal.targetDate || '');
    setStatus(goal.status);
    setType(goal.type);
    setIsAdding(true);
  };

  const handleDelete = async (goalId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this goal? Linked journals will lose this goal tag, but will not be deleted.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/journal/goals/${goalId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        fetchGoals();
        if (selectedGoal && selectedGoal.id === goalId) {
          setSelectedGoal(null);
        }
      }
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  const toggleStatus = async (goal, e) => {
    e.stopPropagation();
    const statuses = ['NOT_STARTED', 'IN_PROGRESS', 'DONE'];
    const nextIndex = (statuses.indexOf(goal.status) + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const payload = {
        title: goal.title,
        targetDate: goal.targetDate,
        status: nextStatus,
        type: goal.type
      };

      const response = await fetch(`${API_BASE_URL}/journal/goals/${goal.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok && data.success) {
        fetchGoals();
        if (selectedGoal && selectedGoal.id === goal.id) {
          setSelectedGoal(data.data);
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const shortTermGoals = goals.filter(g => g.type === 'SHORT_TERM');
  const longTermGoals = goals.filter(g => g.type === 'LONG_TERM');

  return (
    <div className={cn(
      "mx-auto px-6 py-12 md:py-20 flex gap-8 relative", 
      isFullWidth ? "max-w-[120rem] md:px-16" : "max-w-6xl"
    )}>
      {/* Main Panel */}
      <div className="flex-1 min-w-0">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-3xl font-semibold text-text-primary tracking-tight">Goals Dashboard</h2>
            <p className="text-text-secondary text-sm mt-1">Practice intentional living. Break dreams into concrete, actionable steps.</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => { resetForm(); setIsAdding(true); }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-brand hover:bg-brand-hover text-white rounded-full transition-all"
            >
              <Plus size={16} /> New Goal
            </Button>
            <HeaderActions />
          </div>
        </header>

        {error && (
          <div className="p-4 mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 flex gap-3 items-center text-red-500 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-tertiary">
            <Loader2 size={32} className="animate-spin text-brand" />
            <p className="text-sm font-medium">Loading your path...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Short-term Panel */}
            <section className="bg-card-bg/30 border border-border/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
                  S
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Short-term Goals</h3>
                <span className="text-xs text-text-tertiary font-bold px-2 py-0.5 bg-input-bg rounded-md ml-auto">
                  {shortTermGoals.length}
                </span>
              </div>

              {shortTermGoals.length === 0 ? (
                <div className="text-center py-12 text-text-tertiary border border-dashed border-border rounded-2xl">
                  <Target size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No short-term goals. Click "New Goal" to begin.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {shortTermGoals.map(goal => (
                    <GoalRow 
                      key={goal.id} 
                      goal={goal} 
                      onToggle={(e) => toggleStatus(goal, e)}
                      onClick={() => handleGoalClick(goal)}
                      onEdit={(e) => handleEditInit(goal, e)}
                      onDelete={(e) => handleDelete(goal.id, e)}
                      isSelected={selectedGoal?.id === goal.id}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Long-term Panel */}
            <section className="bg-card-bg/30 border border-border/50 rounded-3xl p-6 md:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  L
                </div>
                <h3 className="text-lg font-semibold text-text-primary">Long-term Goals</h3>
                <span className="text-xs text-text-tertiary font-bold px-2 py-0.5 bg-input-bg rounded-md ml-auto">
                  {longTermGoals.length}
                </span>
              </div>

              {longTermGoals.length === 0 ? (
                <div className="text-center py-12 text-text-tertiary border border-dashed border-border rounded-2xl">
                  <Target size={24} className="mx-auto mb-2 opacity-40 text-purple-400" />
                  <p className="text-xs">No long-term visions yet. Capture your dreams here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {longTermGoals.map(goal => (
                    <GoalRow 
                      key={goal.id} 
                      goal={goal} 
                      onToggle={(e) => toggleStatus(goal, e)}
                      onClick={() => handleGoalClick(goal)}
                      onEdit={(e) => handleEditInit(goal, e)}
                      onDelete={(e) => handleDelete(goal.id, e)}
                      isSelected={selectedGoal?.id === goal.id}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Goal Detail Drawer (Right Sidebar) */}
      {selectedGoal && (
        <div className="w-80 md:w-96 border-l border-border bg-card-bg/40 backdrop-blur-md fixed right-0 top-0 h-screen p-8 z-30 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-8 shrink-0">
            <button 
              onClick={() => setSelectedGoal(null)}
              className="text-text-tertiary hover:text-text-primary flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft size={14} /> Close
            </button>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
              selectedGoal.type === 'SHORT_TERM' ? 'bg-brand/10 text-brand' : 'bg-purple-500/10 text-purple-400'
            )}>
              {selectedGoal.type === 'SHORT_TERM' ? 'Short-term' : 'Long-term'}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-text-primary leading-snug">{selectedGoal.title}</h3>
              <p className="text-xs text-text-tertiary mt-2 flex items-center gap-1.5">
                <Clock size={12} /> Target: {selectedGoal.targetDate ? new Date(selectedGoal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No target date'}
              </p>
            </div>

            {/* Status Selector */}
            <div className="bg-input-bg/40 p-4 rounded-2xl border border-border/30">
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3">Status</h4>
              <div className="flex gap-2">
                {['NOT_STARTED', 'IN_PROGRESS', 'DONE'].map(statusVal => (
                  <button
                    key={statusVal}
                    onClick={(e) => toggleStatus(selectedGoal, e)}
                    className={cn(
                      "flex-1 py-1.5 text-center text-xs font-semibold rounded-lg border border-border/60 transition-all",
                      selectedGoal.status === statusVal 
                        ? statusVal === 'DONE' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                          statusVal === 'IN_PROGRESS' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                          'bg-text-secondary/10 border-text-secondary/30 text-text-primary'
                        : 'bg-transparent text-text-tertiary hover:bg-input-bg'
                    )}
                  >
                    {statusVal.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Linked Journal Entries List */}
            <div>
              <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <BookOpen size={14} /> Linked Daily Entries
              </h4>

              {loadingJournals ? (
                <div className="flex items-center gap-2 py-6 text-text-tertiary text-sm">
                  <Loader2 size={16} className="animate-spin text-brand" />
                  <span>Loading linked logs...</span>
                </div>
              ) : linkedJournals.length === 0 ? (
                <div className="py-8 text-center border border-dashed border-border rounded-xl text-text-tertiary text-xs">
                  No linked journal logs yet. Write about this goal in your next entry!
                </div>
              ) : (
                <div className="space-y-3">
                  {linkedJournals.map(journal => (
                    <div 
                      key={journal.id}
                      onClick={() => setActiveJournal(journal)}
                      className="p-3 bg-input-bg/40 border border-border/40 hover:border-brand/40 rounded-xl cursor-pointer transition-all flex justify-between items-center group"
                    >
                      <div>
                        <p className="text-xs text-brand font-bold">
                          {new Date(journal.date || new Date()).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-text-primary font-medium line-clamp-1 mt-0.5">
                          {journal.whatDidIDo}
                        </p>
                      </div>
                      <ChevronRight size={14} className="text-text-tertiary group-hover:text-brand transition-colors shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border shrink-0 flex gap-2">
            <button 
              onClick={(e) => handleEditInit(selectedGoal, e)}
              className="flex-1 py-2 text-center text-xs font-semibold text-text-secondary hover:bg-input-bg transition-colors border border-border rounded-xl flex items-center justify-center gap-1.5"
            >
              <Edit2 size={12} /> Edit Goal
            </button>
            <button 
              onClick={(e) => handleDelete(selectedGoal.id, e)}
              className="py-2 px-3 text-center text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/20 rounded-xl flex items-center justify-center"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Goal Add/Edit Dialog */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/45 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card-bg border border-border rounded-[1.5rem] p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto animate-in scale-in-50 duration-200">
            <h3 className="text-lg font-semibold text-text-primary mb-6">
              {editingGoal ? 'Edit Goal' : 'Create Path Goal'}
            </h3>

            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-2 items-center text-red-500 text-xs">
                <AlertCircle size={16} className="shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-text-secondary font-medium mb-1.5 block">Goal Title</label>
                <InputField 
                  placeholder="What is your focus?" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-text-secondary font-medium mb-1.5 block">Type</label>
                  <select 
                    value={type} 
                    onChange={e => setType(e.target.value)}
                    className="w-full bg-input-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  >
                    <option value="SHORT_TERM">Short-term</option>
                    <option value="LONG_TERM">Long-term</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-text-secondary font-medium mb-1.5 block">Status</label>
                  <select 
                    value={status} 
                    onChange={e => setStatus(e.target.value)}
                    className="w-full bg-input-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
                  >
                    <option value="NOT_STARTED">Not Started</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-text-secondary font-medium mb-1.5 block flex items-center gap-1">
                  <Calendar size={12} /> Target Date (Optional)
                </label>
                <input 
                  type="date" 
                  value={targetDate} 
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full bg-input-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => { resetForm(); setIsAdding(false); }}
                  className="flex-1 py-2 rounded-xl text-sm font-semibold text-text-secondary hover:bg-input-bg transition-colors border border-border"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 rounded-xl text-sm font-semibold bg-brand text-white hover:bg-brand-hover transition-colors"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Journal Viewer modal (reusing JournalModal) */}
      {activeJournal && (
        <JournalModal 
          journal={{ ...activeJournal, mood: activeJournal.feeling }} 
          onClose={() => setActiveJournal(null)} 
        />
      )}
    </div>
  );
}

// ─── Goal Card Subcomponent ─────────────────────────────────────────────
function GoalRow({ goal, onToggle, onClick, onEdit, onDelete, isSelected }) {
  const isDone = goal.status === 'DONE';
  const isInProgress = goal.status === 'IN_PROGRESS';

  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl border bg-card-bg transition-all flex items-start gap-3.5 cursor-pointer relative group",
        isSelected 
          ? 'border-brand shadow-sm ring-1 ring-brand/20' 
          : 'border-border/60 hover:border-border hover:shadow-[0_2px_8px_rgba(0,0,0,0.03)]'
      )}
    >
      <button 
        onClick={onToggle}
        className={cn(
          "mt-0.5 shrink-0 rounded-full transition-colors",
          isDone ? "text-emerald-500 hover:text-emerald-600" : "text-text-tertiary hover:text-brand"
        )}
        title="Cycle Status (Not Started -> In Progress -> Completed)"
      >
        {isDone ? (
          <CheckCircle2 size={18} className="fill-emerald-500/10" />
        ) : isInProgress ? (
          <Circle size={18} className="stroke-amber-400 stroke-2 fill-amber-400/10 animate-[pulse_3s_infinite]" />
        ) : (
          <Circle size={18} className="stroke-[1.5px]" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "text-sm font-medium leading-normal break-words",
          isDone ? "text-text-tertiary line-through font-light" : "text-text-primary"
        )}>
          {goal.title}
        </h4>
        
        <div className="flex items-center gap-3 mt-2 shrink-0">
          <span className={cn(
            "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
            isDone ? "bg-emerald-500/10 text-emerald-400" : 
            isInProgress ? "bg-amber-500/10 text-amber-400" : "bg-text-secondary/15 text-text-secondary"
          )}>
            {goal.status.replace('_', ' ')}
          </span>

          {goal.targetDate && (
            <p className="text-[10px] text-text-tertiary flex items-center gap-1 font-medium">
              <CalendarRange size={10} /> {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>
      </div>

      {/* Row Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
        <button 
          onClick={onEdit}
          className="p-1 hover:bg-input-bg text-text-tertiary hover:text-text-primary rounded-md transition-colors"
          title="Edit"
        >
          <Edit2 size={13} />
        </button>
        <button 
          onClick={onDelete}
          className="p-1 hover:bg-red-500/15 text-text-tertiary hover:text-red-400 rounded-md transition-colors"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
