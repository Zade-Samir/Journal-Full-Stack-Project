import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flower2, ArrowLeft } from 'lucide-react';
import { Button } from '../components/Button';
import { API_BASE_URL } from '../config/api';

export function Completion() {
  const navigate = useNavigate();
  const dateStr = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStreak() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/journal/streak`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const json = await response.json();
        if (response.ok && json.success) {
          setStreak(json.data.streak);
        }
      } catch (err) {
        console.error('Error fetching streak:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStreak();
  }, []);

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-card-bg p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-12 border border-border">
        <Flower2 size={40} className="text-brand" strokeWidth={1.5} />
      </div>

      <p className="text-[11px] font-bold text-brand uppercase tracking-[0.15em] mb-4">Reflection Complete</p>
      
      <h1 className="text-4xl md:text-5xl font-bold text-text-primary tracking-tight mb-4 max-w-lg leading-tight">
        Your thoughts are now at rest.
      </h1>
      
      <p className="text-text-secondary text-lg max-w-md mb-12 leading-relaxed">
        Take a deep breath. You've completed your reflection for <span className="text-text-primary font-medium">{dateStr}</span>.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 mb-24">
        <Button 
          variant="secondary" 
          className="w-full sm:w-auto px-8"
          onClick={() => navigate('/archive')}
        >
          View Archive
        </Button>
        <Button 
          variant="ghost" 
          className="w-full sm:w-auto px-8 gap-2"
          onClick={() => navigate('/create')}
        >
          <ArrowLeft size={16} />
          Back to Today
        </Button>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] text-text-tertiary uppercase tracking-[0.1em]">Reflection Streak</span>
          <span className="text-[10px] font-bold text-brand uppercase tracking-[0.1em]">
            {loading ? 'Loading...' : `${streak} ${streak === 1 ? 'Day' : 'Days'}`}
          </span>
        </div>
        <div className="h-1 w-full bg-border rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

