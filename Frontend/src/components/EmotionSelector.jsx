import React from 'react';
import { cn } from '../utils/cn';
import { Smile, Meh, Frown, Zap, Rocket } from 'lucide-react';

const emotions = [
  { id: 'happy', label: 'Happy', icon: Smile },
  { id: 'neutral', label: 'Neutral', icon: Meh },
  { id: 'sad', label: 'Sad', icon: Frown },
  { id: 'stressed', label: 'Stressed', icon: Zap },
  { id: 'motivated', label: 'Motivated', icon: Rocket },
];

export function EmotionSelector({ selected, onSelect, className }) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {emotions.map((emotion) => {
        const isSelected = selected === emotion.id;
        const Icon = emotion.icon;
        return (
          <button
            key={emotion.id}
            type="button"
            onClick={() => onSelect(emotion.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border",
              isSelected 
                ? "bg-brand border-brand text-white shadow-md shadow-brand/20" 
                : "bg-card-bg border-border text-text-secondary hover:border-text-tertiary hover:bg-input-bg"
            )}
          >
            <Icon size={16} className={cn(isSelected ? "text-white" : "text-text-secondary")} />
            {emotion.label}
          </button>
        );
      })}
    </div>
  );
}
