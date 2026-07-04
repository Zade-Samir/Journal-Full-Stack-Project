import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';
import { PenSquare, LibraryBig, BarChart2, Target, Sparkles, Settings, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

export function Sidebar({
  isPinned,
  isVisible,
  togglePin,
  onMouseLeave,
  onMouseEnter
}) {
  const navigate = useNavigate();
  
  const navItems = [
    { label: "Today", path: "/create", icon: PenSquare, end: true },
    { label: "Archive", path: "/archive", icon: LibraryBig },
    { label: "Goals", path: "/goals", icon: Target },
    { label: "Reflection", path: "/reflection", icon: Sparkles },
    { label: "Analytics", path: "/analytics", icon: BarChart2 },
  ];

  return (
    <aside
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      className={cn(
        "bg-input-bg/95 backdrop-blur-xl fixed flex-col hidden md:flex transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] z-40 overflow-hidden",
        isPinned ? [
          "h-screen top-0 left-0 w-60 py-6 px-4",
          "border-r border-border shadow-none rounded-none"
        ] : [
          "h-1/2 top-4 w-60 py-6 px-4", //line
          "border border-border/80 shadow-[10px_10px_40px_rgba(0,0,0,0.1)] rounded-2xl",
          isVisible ? "left-4 translate-x-0" : "left-0 -translate-x-[120%]"
        ]
      )}
    >
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className={cn("transition-opacity duration-200 delay-100 flex-1 min-w-0 mr-2", isVisible ? "opacity-100" : "opacity-0")}>
          <h1 className="text-[17px] font-bold text-text-primary tracking-tight truncate">The Quiet Room</h1>
          <p className="text-[9px] font-bold text-text-tertiary uppercase tracking-widest mt-0.5 truncate">Your Digital Vellum</p>
        </div>
        <button
          onClick={togglePin}
          className={cn(
            "text-text-tertiary hover:text-text-primary hover:bg-black/5 p-1 rounded-md transition-all shrink-0",
            !isVisible && "opacity-0 pointer-events-none"
          )}
          title={isPinned ? "Close sidebar" : "Lock sidebar"}
        >
          {isPinned ? <ChevronsLeft size={16} /> : <ChevronsRight size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            end={item.end}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap text-sm",
              isActive
                ? "text-brand bg-sidebar-active shadow-[0_1px_3px_rgba(0,0,0,0.06)] font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-black/5"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className={cn("stroke-[1.5px] shrink-0", isActive ? "text-brand" : "")} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <Button className="w-full whitespace-nowrap text-sm py-1.5" onClick={() => navigate('/create')}>
          New Entry
        </Button>
      </div>
    </aside>
  );
}
