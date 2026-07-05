import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Loader2, CheckCircle2, XCircle, ArrowLeft, KeyRound, RefreshCw } from 'lucide-react';

export const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve email passed in navigation state, fallback if missing
  const [email, setEmail] = useState(location.state?.email || '');
  const [showEmailInput, setShowEmailInput] = useState(!location.state?.email);
  
  // OTP array state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  // UI state
  const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [resendCooldown, setResendCooldown] = useState(0);

  // Focus first input box on load
  useEffect(() => {
    if (!showEmailInput && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [showEmailInput]);

  // Handle countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Input change handler
  const handleChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const singleDigit = value.substring(value.length - 1);
    const newOtp = [...otp];
    newOtp[index] = singleDigit;
    setOtp(newOtp);

    // Auto-advance to next input box
    if (singleDigit && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  // Input backspace handler
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs[index - 1].current.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Paste handler
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pasteData)) return; // Only allow 6-digit numeric paste

    const digits = pasteData.split('');
    setOtp(digits);
    inputRefs[5].current.focus();
  };

  // Submit OTP function
  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const codeString = otp.join('');
    if (codeString.length !== 6) {
      setStatus('error');
      setMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    if (!email) {
      setStatus('error');
      setMessage('Email address is required for verification.');
      return;
    }

    setStatus('verifying');
    setMessage('Verifying your passcode, please wait...');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: codeString }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || 'Invalid passcode or verification failed.');
      }

      setStatus('success');
      setMessage('Your email has been verified successfully! You can now log in.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Verification failed. Please try again.');
    }
  };

  // Submit automatically when all 6 digits are filled
  useEffect(() => {
    if (otp.every(digit => digit !== '') && email && status !== 'success' && status !== 'verifying') {
      handleVerify();
    }
  }, [otp, email]);

  // Resend OTP function
  const handleResend = async () => {
    if (!email) {
      setResendStatus('error');
      setMessage('Please specify an email address to send the verification code to.');
      return;
    }

    setResendStatus('sending');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/resend-otp?email=${encodeURIComponent(email)}`, {
        method: 'POST',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(data.message || data.error || 'Failed to resend verification code.');
      }

      setResendStatus('success');
      setResendCooldown(60); // 60 seconds cooldown
      setStatus('idle');
      setMessage('A new 6-digit verification code has been dispatched!');
      setOtp(['', '', '', '', '', '']);
      if (inputRefs[0].current) inputRefs[0].current.focus();
    } catch (err) {
      setResendStatus('error');
      setStatus('error');
      setMessage(err.message || 'Could not dispatch resend. Try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-bg-base font-sans text-text-primary items-center justify-center p-6 relative">
      
      {/* Back button */}
      <Link to="/login" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
        <ArrowLeft size={16} />
        Back to Login
      </Link>

      <div className="w-full max-w-md p-8 sm:p-12 rounded-[2rem] border border-border bg-card-bg shadow-xl flex flex-col items-center relative overflow-hidden">
        
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand/5 blur-3xl rounded-full -z-10 animate-pulse"></div>

        {status === 'success' ? (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300 w-full">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-6 text-green-500">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-3 tracking-tight">Email Verified!</h1>
            <p className="text-sm text-text-secondary leading-relaxed max-w-xs mb-8">
              {message}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full px-8 py-3.5 rounded-full bg-text-primary text-bg-base text-sm font-semibold tracking-wide hover:opacity-90 transition-colors shadow-lg"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center w-full">
            
            <div className="w-16 h-16 rounded-full bg-brand/5 flex items-center justify-center mb-6 border border-border">
              <KeyRound size={28} className="text-text-secondary" />
            </div>

            <h1 className="text-2xl font-bold mb-3 tracking-tight text-center">Verify Your Account</h1>
            
            {showEmailInput ? (
              <div className="w-full space-y-4 text-center">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Enter the email address you registered with to receive your 6-digit validation passcode:
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="flex-1 px-5 py-3 rounded-full border border-border bg-input-bg text-sm focus:outline-none focus:ring-2 focus:ring-border focus:border-transparent transition-all placeholder:text-text-tertiary"
                  />
                  <button
                    onClick={() => {
                      if (email) {
                        setShowEmailInput(false);
                      }
                    }}
                    className="px-6 py-3 rounded-full bg-text-primary text-bg-base text-xs font-semibold hover:opacity-95 transition-opacity"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full text-center">
                <p className="text-sm text-text-secondary leading-relaxed mb-1">
                  We've sent a 6-digit passcode to:
                </p>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-sm font-semibold text-text-primary">{email}</span>
                  <button
                    onClick={() => setShowEmailInput(true)}
                    className="text-xs text-brand hover:underline font-medium"
                  >
                    (Change)
                  </button>
                </div>

                {message && (
                  <div className={`mb-6 p-4 rounded-2xl text-sm border flex items-start gap-3 text-left ${
                    status === 'error' 
                      ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                      : 'bg-green-500/10 border-green-500/20 text-green-500'
                  }`}>
                    {status === 'error' ? <XCircle size={18} className="shrink-0 mt-0.5" /> : <CheckCircle2 size={18} className="shrink-0 mt-0.5" />}
                    <p className="leading-snug">{message}</p>
                  </div>
                )}

                <form onSubmit={handleVerify} className="space-y-8">
                  {/* Pin box layout */}
                  <div className="flex justify-between gap-2 max-w-sm mx-auto" onPaste={handlePaste}>
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-input-${idx}`}
                        ref={inputRefs[idx]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        disabled={status === 'verifying'}
                        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl border border-border bg-input-bg focus:outline-none focus:ring-2 focus:ring-border focus:border-transparent transition-all disabled:opacity-50"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={status === 'verifying' || otp.some(d => d === '')}
                    className="w-full py-3.5 rounded-full bg-text-primary text-bg-base text-sm font-semibold tracking-wide hover:opacity-90 disabled:opacity-50 transition-opacity flex justify-center items-center gap-2 shadow-lg"
                  >
                    {status === 'verifying' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Code'
                    )}
                  </button>
                </form>

                {/* Resend panel */}
                <div className="mt-8 pt-6 border-t border-border flex flex-col items-center gap-2">
                  <p className="text-xs text-text-tertiary">
                    Didn't receive the email?
                  </p>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || resendStatus === 'sending'}
                    onClick={handleResend}
                    className="text-xs font-semibold text-text-secondary hover:text-text-primary disabled:opacity-40 transition-colors flex items-center gap-2 py-1 px-3 rounded-full hover:bg-input-bg border border-transparent hover:border-border"
                  >
                    {resendStatus === 'sending' ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <RefreshCw size={12} className={resendCooldown > 0 ? '' : 'animate-hover'} />
                    )}
                    {resendCooldown > 0 
                      ? `Resend in ${resendCooldown}s` 
                      : 'Resend Passcode'}
                  </button>
                </div>
              </div>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
};
