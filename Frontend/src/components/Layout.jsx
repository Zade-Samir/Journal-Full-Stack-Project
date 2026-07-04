import React, { useState, useRef } from 'react';
import { Sidebar } from './Sidebar';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { cn } from '../utils/cn';

export function Layout() {
  const [isPinned, setIsPinned] = useState(false); // Default to unpinned/minimized like Notion usually starts 
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  
  const timerRef = useRef(null);

  const handleMouseEnterEdge = () => {
    if (!isPinned) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsHoverOpen(true);
    }
  };

  const handleMouseLeaveSidebar = () => {
    if (!isPinned) {
      timerRef.current = setTimeout(() => {
        setIsHoverOpen(false);
      }, 250); // Faster close response
    }
  };

  const handleMouseEnterSidebar = () => {
    if (!isPinned) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsHoverOpen(true);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (isPinned) setIsHoverOpen(false);
  };

  const isVisible = isPinned || isHoverOpen;

  return (
    <div className="min-h-screen bg-bg-base flex relative">
      {/* 
        Hover zone on the extreme left. 
        When unpinned, hovering this will trigger the sidebar overlay.
      */}
      {!isPinned && !isHoverOpen && (
        <div 
          className="fixed left-0 top-0 w-12 h-screen z-30" 
          onMouseEnter={handleMouseEnterEdge}
        />
      )}
      
      {/* 
        The top-left hamburger "rectangle box" button.
        This provides a clear visual indicator of the collapsed sidebar.
      */}
      {!isPinned && (
        <div 
          onMouseEnter={handleMouseEnterEdge}
          className={cn(
            "fixed top-6 left-6 z-20 flex items-center gap-4 transition-all duration-300", 
            isHoverOpen ? "opacity-0 -translate-x-4 pointer-events-none" : "opacity-100 translate-x-0"
          )}
        >
          <button 
            onClick={() => setIsHoverOpen(true)}
            className="p-1.5 bg-input-bg border border-border/60 hover:bg-border/40 text-text-secondary hover:text-text-primary rounded-md shadow-sm transition-colors"
            title="Open sidebar"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      <Sidebar 
        isPinned={isPinned} 
        isVisible={isVisible} 
        togglePin={togglePin}
        onMouseLeave={handleMouseLeaveSidebar}
        onMouseEnter={handleMouseEnterSidebar}
      />

      <main 
        className={cn(
          "flex-1 w-full relative transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          isPinned ? "md:ml-60 ml-0" : "ml-0"
        )}
      >
        <Outlet />
      </main>
    </div>
  );
}
