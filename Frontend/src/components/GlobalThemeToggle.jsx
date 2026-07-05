import React, { useState, useRef, useEffect } from 'react';
import { Palette, X } from 'lucide-react';
import { useAppSettings } from '../context/AppSettingsContext';
import { cn } from '../utils/cn';

const THEMES = [
  { id: 'navy',  label: 'Dark Blue', colorBg: 'bg-[#131D26]', border: 'border-[#263B4C]' },
  { id: 'dark',  label: 'Charcoal',  colorBg: 'bg-[#121212]', border: 'border-[#333333]' },
  { id: 'dim',   label: 'Midnight',  colorBg: 'bg-[#0f172a]', border: 'border-[#334155]' },
  { id: 'light', label: 'Clean Slate', colorBg: 'bg-[#F8FAFC]', border: 'border-[#E2E8F0]' },
];

export function GlobalThemeToggle() {
  const { theme, setTheme } = useAppSettings();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      {/* Theme Selection Popover Menu */}
      {isOpen && (
        <div className="bg-card-bg/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-3 flex flex-col gap-2 min-w-[150px] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between px-1 pb-1 border-b border-border/30">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">Themes</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X size={12} />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {THEMES.map(({ id, label, colorBg, border }) => (
              <button
                key={id}
                onClick={() => {
                  setTheme(id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-input-bg transition-all text-left",
                  theme === id && "text-brand bg-brand/10 hover:bg-brand/15 hover:text-brand"
                )}
              >
                <span className={cn("h-3.5 w-3.5 rounded-full border shadow-sm", colorBg, border)} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border transform hover:-translate-y-1 hover:scale-105",
          theme === 'dark' 
            ? "bg-[#1E1E1E] text-[#EDEDED] border-[#333333]" 
            : theme === 'dim'
            ? "bg-[#1e293b] text-[#f8fafc] border-[#334155]"
            : theme === 'light'
            ? "bg-[#FFFFFF] text-[#0F172A] border-[#E2E8F0]"
            : "bg-[#1B2A36] text-[#E2E8F0] border-[#263B4C]"
        )}
        title="Change App Theme"
      >
        <Palette size={20} className={cn("transition-colors duration-300", theme === 'light' ? "text-brand" : "text-brand")} />
      </button>
    </div>
  );
}
