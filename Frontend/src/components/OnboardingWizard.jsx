import React, { useState } from 'react';
import { Target, ArrowRight, CheckCircle2, Heart, Award, Sparkles, BookOpen } from 'lucide-react';
import { InputField } from './InputField';
import { Button } from './Button';
import { cn } from '../utils/cn';

const FOCUS_OPTIONS = [
  { id: 'mindfulness', label: 'Mindfulness & Mood Tracking', icon: Heart, desc: 'Understand feelings and build emotional awareness.' },
  { id: 'growth',      label: 'Growth & Goal Setting',       icon: Award, desc: 'Define goals, track small achievements daily.' },
  { id: 'gratitude',   label: 'Gratitude & Appreciation',    icon: Sparkles, desc: 'Focus on positive things and thankfulness.' },
  { id: 'reflections', label: 'Reflections & Brain Dump',    icon: BookOpen, desc: 'Unload thoughts and organize mental space.' },
];

export function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [selectedFocus, setSelectedFocus] = useState([]);
  const [goalTitle, setGoalTitle] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleFocus = (id) => {
    setSelectedFocus(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (selectedFocus.length === 0) {
      setError("Please select at least one area of focus to continue.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinish = async () => {
    if (!goalTitle.trim()) {
      setError("Please set a goal title (e.g. 'Read for 15 minutes daily').");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Create the user's first goal
        const payload = {
          title: goalTitle,
          status: 'IN_PROGRESS',
          type: 'SHORT_TERM',
          targetDate: targetDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // default 7 days from now
        };

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/goals`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (!res.ok || json.success === false) {
          throw new Error(json.message || "Failed to create first goal.");
        }
      }
      
      // Save onboarding complete in localStorage
      localStorage.setItem('onboardingCompleted', 'true');
      onComplete();
    } catch (err) {
      setError(err.message || "Something went wrong. Let's start anyway.");
      // Fallback: let them start even if goal fails
      localStorage.setItem('onboardingCompleted', 'true');
      setTimeout(onComplete, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-bg-base/95 backdrop-blur-md">
      <div className="w-full max-w-lg bg-card-bg border border-border/60 rounded-3xl shadow-2xl p-8 flex flex-col gap-6 relative animate-in fade-in zoom-in-95 duration-300">
        
        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 justify-center">
          <div className={cn("h-1.5 w-6 rounded-full transition-all duration-300", step === 1 ? "bg-brand" : "bg-border/60")} />
          <div className={cn("h-1.5 w-6 rounded-full transition-all duration-300", step === 2 ? "bg-brand" : "bg-border/60")} />
        </div>

        {/* Step 1: Primary Focus */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-text-primary">Welcome to Quiet Room</h2>
              <p className="text-sm text-text-secondary mt-1">Let's personalize your dashboard. What do you want to focus on?</p>
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center font-medium bg-red-500/10 border border-red-500/20 py-2 rounded-xl">
                {error}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {FOCUS_OPTIONS.map(({ id, label, icon: Icon, desc }) => {
                const isSelected = selectedFocus.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => toggleFocus(id)}
                    className={cn(
                      "flex flex-col items-start gap-2 p-4 rounded-2xl border text-left transition-all hover:translate-y-[-2px] hover:shadow-md",
                      isSelected 
                        ? "bg-brand/10 border-brand text-text-primary" 
                        : "bg-input-bg/40 border-border/60 text-text-secondary hover:border-brand/30"
                    )}
                  >
                    <Icon size={20} className={isSelected ? "text-brand" : "text-text-tertiary"} />
                    <div>
                      <p className="text-xs font-semibold text-text-primary leading-tight">{label}</p>
                      <p className="text-[10px] text-text-tertiary mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button 
              size="lg" 
              onClick={handleNext}
              className="mt-4 flex items-center justify-center gap-2 rounded-full"
            >
              Next step <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Step 2: First Goal */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-text-primary">Set Your First Goal</h2>
              <p className="text-sm text-text-secondary mt-1">Quiet Room helps you connect daily writing with targets. Start with something simple!</p>
            </div>

            {error && (
              <p className="text-xs text-red-400 text-center font-medium bg-red-500/10 border border-red-500/20 py-2 rounded-xl">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Goal Title</label>
                <InputField 
                  placeholder="e.g. Read for 15 minutes, Meditate before bed" 
                  value={goalTitle}
                  onChange={e => setGoalTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-text-tertiary uppercase tracking-widest">Target Completion Date (Optional)</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  className="w-full bg-input-bg border border-border/60 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-brand/40 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 border border-border/60 text-text-secondary hover:bg-input-bg/50 rounded-full text-sm font-semibold transition-colors"
              >
                Back
              </button>
              <Button 
                onClick={handleFinish}
                disabled={loading}
                className="flex-2 flex items-center justify-center gap-2 rounded-full"
              >
                {loading ? "Saving..." : "Start Journaling"}
                <CheckCircle2 size={16} />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
