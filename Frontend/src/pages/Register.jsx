import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import illustration from '../assets/login-illustration.png';
import { Link, useNavigate } from 'react-router-dom';

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || "Registration failed. Server error.");
      }

      // Success -> send to OTP verification page
      navigate('/verify-otp', { 
        state: { 
          email: email
        } 
      });
    } catch (err) {
      // Common issue: CORS or connection refused when backend is down
      if (err.message.includes('fetch')) {
        setError("Cannot reach backend server. Are the services running?");
      } else {
        setError(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-bg-base font-sans text-text-primary">
      
      {/* Left side: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 xl:p-24 relative">
        
        <Link to="/" className="absolute top-8 left-8 sm:left-12 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
          <ArrowLeft size={16} />
          Back 
        </Link>

        <div className="w-full max-w-sm">
          
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold mb-3 tracking-tight">Create an account</h1>
            <p className="text-sm text-text-secondary leading-relaxed">
              Start your mindful journey and organize your thoughts perfectly today.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3 items-center text-red-500 text-sm">
              <AlertCircle size={18} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleRegister}>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name" 
                className="w-1/2 px-5 py-3.5 rounded-full border border-border bg-input-bg text-sm focus:outline-none focus:ring-2 focus:ring-border focus:border-transparent transition-all placeholder:text-text-tertiary"
              />
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name" 
                className="w-1/2 px-5 py-3.5 rounded-full border border-border bg-input-bg text-sm focus:outline-none focus:ring-2 focus:ring-border focus:border-transparent transition-all placeholder:text-text-tertiary"
              />
            </div>

            <div>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" 
                className="w-full px-5 py-3.5 rounded-full border border-border bg-input-bg text-sm focus:outline-none focus:ring-2 focus:ring-border focus:border-transparent transition-all placeholder:text-text-tertiary"
              />
            </div>
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" 
                className="w-full px-5 py-3.5 rounded-full border border-border bg-input-bg text-sm focus:outline-none focus:ring-2 focus:ring-border focus:border-transparent transition-all placeholder:text-text-tertiary pr-12"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password" 
                className="w-full px-5 py-3.5 rounded-full border border-border bg-input-bg text-sm focus:outline-none focus:ring-2 focus:ring-border focus:border-transparent transition-all placeholder:text-text-tertiary pr-12"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 mt-8 rounded-full bg-text-primary text-bg-base text-sm font-semibold tracking-wide hover:opacity-90 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Signing up..." : "Sign up"}
            </button>
          </form>

          <div className="relative mt-10 mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bg-base px-4 text-text-tertiary">or sign up with</span>
            </div>
          </div>

          <div className="flex justify-center items-center">
            <button 
              type="button"
              onClick={() => window.location.href = `${import.meta.env.VITE_AUTH_BASE_URL}/oauth2/authorization/google`}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-full border border-border bg-input-bg text-sm font-semibold hover:bg-card-bg transition-colors"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Continue with Google
            </button>
          </div>
          
        </div>
        
        {/* Footer Link */}
        <div className="absolute bottom-8 text-xs text-center w-full pb-4">
          <span className="text-text-secondary">Already a member? </span>
          <Link to="/login" className="font-semibold text-text-primary hover:underline">Log in</Link>
        </div>
      </div>

      {/* Right side: Illustration Panel */}
      <div className="hidden lg:flex w-1/2 p-4">
        <div className="w-full h-full bg-brand/5 rounded-[2rem] flex flex-col justify-center items-center p-12 relative overflow-hidden">
           
           <img 
             src={illustration} 
             alt="Mindful Meditation" 
             className="w-full max-w-sm xl:max-w-md object-contain mb-8"
           />
           
           <div className="text-center z-10 mt-4">
              <p className="text-xl text-text-primary font-medium">
                Make your thoughts easier and organized
              </p>
              <p className="text-xl text-text-primary font-bold mt-1">
                with The Quiet Room
              </p>
           </div>
           
           {/* Carousel dots placeholder */}
           <div className="flex items-center gap-2 mt-8">
             <div className="w-6 h-2 rounded-full bg-text-primary"></div>
             <div className="w-2 h-2 rounded-full bg-border"></div>
             <div className="w-2 h-2 rounded-full bg-border"></div>
           </div>

        </div>
      </div>

    </div>
  );
};
