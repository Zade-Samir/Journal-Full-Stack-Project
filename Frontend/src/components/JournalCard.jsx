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

export function JournalCard({ date, mood, fullData, className }) {
  const { Icon, color } = moodIconMap[mood] || moodIconMap.neutral;
  const d = fullData || {};

  const gratitude = (d.gratitude || []).filter(g => g?.trim());
  const shortGoals = (d.shortTermGoal || []).filter(g => g?.trim());
  const longGoals  = (d.longTermGoal  || []).filter(g => g?.trim());

  return (
    <div className={cn(
      'bg-card-bg rounded-2xl p-5 border border-border hover:border-brand/30 hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-all cursor-pointer group h-fit',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase leading-tight">{date}</p>
        <div className={cn('opacity-70 group-hover:opacity-100 transition-opacity shrink-0', color)}>
          <Icon size={17} />
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
