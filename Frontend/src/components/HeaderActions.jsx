import React, { useEffect, useState, useRef } from 'react';
import { User, MoreHorizontal, ArrowLeftRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppSettings } from '../context/AppSettingsContext';
import { cn } from '../utils/cn';

export function HeaderActions({ className }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const { isFullWidth, setIsFullWidth } = useAppSettings();
  const navigate = useNavigate();

  let userEmail = "Journal Keeper";
  try {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userEmail = payload.sub || payload.email || "Journal Keeper";
    }
  } catch(e) {}


  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className={cn("flex items-center gap-3 relative", className)}>
      <div className="relative" ref={profileRef}>
        <button 
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="h-8 w-8 bg-text-primary rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-sm hover:opacity-90 transition-opacity"
          title="Account"
        >
          <User size={16} className="text-bg-base" strokeWidth={2.5} />
        </button>

        {isProfileOpen && (
          <div className="absolute right-0 top-full mt-3 w-64 bg-card-bg/95 backdrop-blur-xl border border-border/50 rounded-[1.25rem] shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
            
            <div className="p-4 border-b border-border/50 bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/20">
                  <User size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-text-primary truncate" title={userEmail}>
                    {userEmail.split('@')[0]}
                  </p>
                  <p className="text-xs text-text-tertiary truncate">{userEmail}</p>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  navigate('/login');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="text-text-secondary hover:text-text-primary transition-colors p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
        title="Page Settings"
      >
        <MoreHorizontal size={20} />
      </button>

      {isMenuOpen && (
        <div ref={menuRef} className="absolute right-0 top-full mt-3 w-72 bg-card-bg/95 backdrop-blur-xl border border-border/50 rounded-[1.25rem] shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 origin-top-right">
          
          <div className="px-3 py-2.5 mb-1 border-b border-border/50">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-[0.15em]">Display Settings</span>
          </div>

          <div 
            className="flex flex-col gap-1 px-3 py-3 hover:bg-input-bg rounded-xl cursor-pointer transition-colors mt-1 group" 
            onClick={() => setIsFullWidth(!isFullWidth)}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 text-sm text-text-primary font-medium">
                <div className="p-1.5 rounded-lg bg-text-tertiary/10 text-text-secondary group-hover:text-brand group-hover:bg-brand/10 transition-colors">
                  <ArrowLeftRight size={16} />
                </div>
                Full Canvas Width
              </div>
              
              <button 
                className={cn(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none shadow-sm",
                  isFullWidth ? "bg-brand" : "bg-border"
                )}
              >
                <span 
                  className={cn(
                    "pointer-events-none absolute left-[2px] top-[2px] inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out",
                    isFullWidth ? "translate-x-4" : "translate-x-0"
                  )} 
                />
              </button>
            </div>
            <p className="text-xs text-text-tertiary pl-10 mt-0.5 leading-relaxed pr-8">
              Expands the editor seamlessly across ultra-wide monitors.
            </p>
          </div>
          
        </div>
      )}
    </div>
  );
}
