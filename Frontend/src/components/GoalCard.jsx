import React from 'react';
import { cn } from '../utils/cn';

export function GoalCard({ title, icon: Icon, children, className }) {
  return (
    <div className={cn("bg-card-bg border border-border rounded-2xl p-6 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow", className)}>
      <div className="flex items-center gap-2 mb-4 text-text-primary font-medium">
        {Icon && <Icon size={18} className="text-text-secondary" />}
        <h4>{title}</h4>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );
}
