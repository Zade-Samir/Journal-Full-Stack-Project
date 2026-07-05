import React from 'react';
import { cn } from '../utils/cn';
import { Smile, Meh, Frown, Zap, Rocket, Star, Target, BookOpen, Heart } from 'lucide-react';

const moodIconMap = {
  happy: { Icon: Smile, color: 'text-yellow-400' },
  neutral: { Icon: Meh, color: 'text-text-tertiary' },
  sad: { Icon: Frown, color: 'text-blue-400' },
  stressed: { Icon: Zap, color: 'text-red-400' },
  motivated: { Icon: Rocket, color: 'text-brand' },
};

function Section({ label, children }) {
  return (
    <div className="mb-3">
      <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-[0.12em] mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function Bullet({ text }) {
  if (!text?.trim()) return null;
  return (
    <div className="flex items-start gap-2 mb-1">
      <span className="mt-1.5 w-1 h-1 rounded-full bg-brand/50 shrink-0" />
      <p className="text-text-primary text-[13px] leading-snug line-clamp-2">{text}</p>
    </div>
  );
}

export function JournalCard({ date, mood, fullData, onToggleStar, className }) {
  const d = fullData || {};
  const { Icon, color } = moodIconMap[mood] || moodIconMap.neutral;
  const isStarred = d.starred || false;

  const gratitude = (d.gratitude || []).filter(g => g?.trim());
  const shortGoals = (d.shortTermGoal || []).filter(g => g?.trim());
  const longGoals  = (d.longTermGoal  || []).filter(g => g?.trim());

  // Calculate word count & reading time
  const texts = [
    d.whatDidIDo,
    d.bestMoment,
    d.worstMoment,
    d.whatILearned,
    d.whatIDoForGoal,
    d.feelingNote,
    ...gratitude,
    ...shortGoals,
    ...longGoals
  ];
  const combinedText = texts.filter(t => typeof t === 'string' && t.trim()).join(' ');
  const words = combinedText.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const handleStarClick = async (e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      const targetId = d.id;
      if (!targetId && targetId !== 0) return;

      const newStarred = !isStarred;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/journal/${targetId}/star?starred=${newStarred}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        if (onToggleStar) {
          onToggleStar(targetId, newStarred);
        }
      }
    } catch (err) {
      console.error("Error toggling star status", err);
    }
  };

  return (
    <div className={cn(
      'bg-card-bg rounded-2xl p-5 border border-border hover:border-brand/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all cursor-pointer group h-fit',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase leading-tight">{date}</p>
          <p className="text-[9px] text-text-tertiary font-medium mt-1">
            {wordCount} words · ~{readingTime} min read
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleStarClick}
            className={cn(
              "p-1.5 rounded-full transition-all hover:bg-black/10 dark:hover:bg-white/5",
              isStarred ? "text-amber-400" : "text-text-tertiary md:opacity-0 md:group-hover:opacity-100 hover:text-text-secondary"
            )}
            title={isStarred ? "Unstar Entry" : "Star Entry"}
          >
            <Star size={14} fill={isStarred ? "currentColor" : "none"} />
          </button>
          <div className={cn('opacity-70 group-hover:opacity-100 transition-opacity', color)}>
            <Icon size={17} />
          </div>
        </div>
      </div>

      {/* What I did */}
      {d.whatDidIDo && (
        <p className="text-text-primary text-[14px] leading-relaxed mb-3 line-clamp-3 font-medium">
          {d.whatDidIDo}
        </p>
      )}

      {/* Divider */}
      {(d.bestMoment || d.whatILearned || gratitude.length > 0 || shortGoals.length > 0) && (
        <div className="border-t border-border/50 my-3" />
      )}

      {/* Best Moment */}
      {d.bestMoment && (
        <Section label="✦ Best moment">
          <p className="text-text-secondary text-[13px] leading-snug line-clamp-2">{d.bestMoment}</p>
        </Section>
      )}

      {/* What I Learned */}
      {d.whatILearned && (
        <Section label="📖 Learned">
          <p className="text-text-secondary text-[13px] leading-snug line-clamp-2">{d.whatILearned}</p>
        </Section>
      )}

      {/* Gratitude */}
      {gratitude.length > 0 && (
        <Section label="🙏 Grateful for">
          {gratitude.slice(0, 3).map((g, i) => <Bullet key={i} text={g} />)}
        </Section>
      )}

      {/* Goals */}
      {shortGoals.length > 0 && (
        <Section label="🎯 Goals">
          {shortGoals.slice(0, 2).map((g, i) => <Bullet key={i} text={g} />)}
        </Section>
      )}

      {/* What I did for goals */}
      {d.whatIDoForGoal && (
        <Section label="⚡ Action taken">
          <p className="text-text-secondary text-[13px] leading-snug line-clamp-2">{d.whatIDoForGoal}</p>
        </Section>
      )}

      {/* Feeling note */}
      {d.feelingNote && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-text-tertiary text-[12px] italic line-clamp-1">"{d.feelingNote}"</p>
        </div>
      )}
    </div>
  );
}
