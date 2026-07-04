import React from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Shield, Sparkles, MoveRight } from 'lucide-react';
import illustration from '../assets/login-illustration.png';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans selection:bg-border">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-bg-base/80 backdrop-blur-md z-50 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-text-primary text-bg-base rounded-lg flex items-center justify-center">
              <PenTool size={18} />
            </div>
            The Quiet Room
          </div>
          
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium hover:text-text-secondary transition-colors">
              Log in
            </Link>
            <Link to="/login" className="bg-text-primary text-bg-base px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-colors shadow-sm">
              Sign up free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          
          <div className="flex-1 text-center md:text-left z-10 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-card-bg border border-border text-text-secondary text-xs font-semibold uppercase tracking-wide mb-8">
              <Sparkles size={14} />
              <span>Your Digital Sanctuary</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-text-primary">
              Clear your mind. <br className="hidden md:block"/>
              <span className="text-text-tertiary">Capture your day.</span>
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl leading-relaxed mx-auto md:mx-0">
              A minimalist, distraction-free journaling experience designed to help you focus, reflect, and find peace in a noisy world.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-text-primary text-bg-base px-8 py-4 rounded-full text-base font-semibold hover:opacity-90 transition-colors shadow-lg">
                Start writing now
                <MoveRight size={18} />
              </Link>
              <Link to="/create" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-full text-base font-semibold hover:bg-card-bg transition-colors">
                View Demo App
              </Link>
            </div>
          </div>

          <div className="flex-1 relative w-full flex justify-center">
             <div className="absolute inset-0 bg-brand/10 rounded-[3rem] -rotate-6 transform scale-105 -z-10"></div>
             <img 
               src={illustration} 
               alt="Journaling perfectly" 
               className="w-full max-w-lg object-contain relative z-10"
             />
          </div>
          
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-input-bg border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why use The Quiet Room?</h2>
            <p className="text-text-secondary text-lg">Designed exclusively for mindfulness and focus.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="bg-card-bg p-8 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-bg-base text-brand rounded-2xl flex items-center justify-center mb-6">
                <Shield size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Private</h3>
              <p className="text-text-secondary leading-relaxed">
                Your thoughts belong to you. We use enterprise-grade encryption to ensure your entries are entirely secure.
              </p>
            </div>

            <div className="bg-card-bg p-8 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-bg-base text-brand rounded-2xl flex items-center justify-center mb-6">
                <PenTool size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Distraction Free</h3>
              <p className="text-text-secondary leading-relaxed">
                A gorgeous, minimalist editor that hides away all the noise so you can focus purely on writing and reflecting.
              </p>
            </div>

            <div className="bg-card-bg p-8 rounded-3xl shadow-sm border border-border flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-bg-base text-brand rounded-2xl flex items-center justify-center mb-6">
                <Sparkles size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Mood Tracking</h3>
              <p className="text-text-secondary leading-relaxed">
                Tag your emotional state with every entry, helping you identify trends and triggers in your mental health.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-bg-base border-t border-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-text-tertiary text-sm">
            © 2026 The Quiet Room. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-text-secondary">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-text-primary transition-colors">Twitter</a>
          </div>
        </div>
      </footer>

    </div>
  );
};
