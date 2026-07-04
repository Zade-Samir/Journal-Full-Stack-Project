import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JournalModal } from './JournalModal';

export function TakeNoteBar() {
  const navigate = useNavigate();
  const [todayJournal, setTodayJournal] = useState(null);

  const handleClick = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/create'); return; }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/today`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && data.data?.id) {
        // Today's journal already exists — show it in modal (edit mode)
        const entry = data.data;
        setTodayJournal({
          id: entry.id,
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
          preview: entry.whatDidIDo || entry.bestMoment || 'Empty entry...',
          mood: entry.feeling || 'neutral',
          fullData: entry
        });
      } else {
        // No journal for today — go to create page
        navigate('/create');
      }
    } catch {
      navigate('/create');
    }
  };

  return (
    <>
      <div className="w-full max-w-lg mx-auto mb-10 relative">
        <div
          className="bg-input-bg border border-border shadow-md transition-all duration-300 overflow-hidden hover:shadow-lg rounded-full p-3 px-6 cursor-pointer flex items-center justify-between hover:border-text-secondary/30"
          onClick={handleClick}
        >
          <span className="text-text-tertiary text-[15px] font-medium tracking-wide">Take a note...</span>
          <div className="flex items-center gap-5 text-text-tertiary"></div>
        </div>
      </div>

      <JournalModal
        journal={todayJournal}
        onClose={() => setTodayJournal(null)}
        onDelete={() => setTodayJournal(null)}
        onUpdate={(updated) => {
          setTodayJournal(prev => ({
            ...prev,
            preview: updated.whatDidIDo || updated.bestMoment || 'Empty entry...',
            mood: updated.feeling || 'neutral',
            fullData: updated
          }));
        }}
        startInEditMode={!!todayJournal}
      />
    </>
  );
}
