import React from 'react';
import { Palette } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';
import { cn } from '../utils/cn';

export function GlobalThemeToggle() {
  const { theme, toggleTheme } = useAppSettings();

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={toggleTheme}
        className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border transform hover:-translate-y-1",
          theme === 'dark' 
            ? "bg-[#1E1E1E] text-[#EDEDED] border-[#333333] hover:bg-black/20" 
            : "bg-[#1B2A36] text-[#E2E8F0] border-[#263B4C] hover:bg-black/20"
        )}
        title="Toggle Theme Color"
      >
        <Palette size={22} className={theme === 'dark' ? "text-text-secondary" : "text-brand"} />
      </button>
    </div>
  );
}
