import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShoppingBag, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
  Building,
  KeyRound,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { authService } from '../services/authService';
import { UTMUser, ALLOWED_UTM_DOMAINS } from '../types';
import { FacultySelect } from './FacultySelect';

export type AuthModalMode = 'login' | 'register' | 'email-sent' | 'verified-success' | 'verify' | 'forgot' | 'reset';

interface UtmAuthModalProps {
  isOpen: boolean;
  initialMode?: AuthModalMode;
  onClose: () => void;
  onSuccess: (user: UTMUser) => void;
  intendedActionLabel?: string;
}

export const UtmAuthModal: React.FC<UtmAuthModalProps> = ({
  isOpen,
  initialMode = 'login',
  onClose,
  onSuccess,
  intendedActionLabel,
}) => {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  
  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [faculty, setFaculty] = useState('Faculty of Computing (FC)');
  const [studentId, setStudentId] = useState('');
  
  // Verification & Reset Code
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Email Verification Confirmation Flow States
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [verifiedSuccessUser, setVerifiedSuccessUser] = useState<UTMUser | null>(null);

  // Simulated inbox preview for smooth testing without exposing tokens in logs
  const [simulatedInboxPreview, setSimulatedInboxPreview] = useState<{
    code: string;
    targetEmail: string;
    type: 'verification' | 'reset';
  } | null>(null);

  // Sync mode if initialMode changes
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Check email verification automatically on window focus and polling when in 'email-sent' mode
  useEffect(() => {
    if (mode !== 'email-sent') return;

    let isMounted = true;
    const target = registeredEmail || email;
    if (!target) return;

    const performCheck = async () => {
      try {
        const result = await authService.checkEmailVerificationStatus(target);
        if (isMounted && result.verified && result.user) {
          setVerifiedSuccessUser(result.user);
          setMode('verified-success');
        }
      } catch (err) {
        console.warn('Auto verification check notice:', err);
      }
    };

    // 1. Immediately check when user switches back to this tab from their email app
    const onFocus = () => {
      performCheck();
    };
    window.addEventListener('focus', onFocus);

    // 2. Poll every 4 seconds while awaiting email verification
    const timer = setInterval(() => {
      performCheck();
    }, 4000);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', onFocus);
      clearInterval(timer);
    };
  }, [mode, registeredEmail, email]);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setResendStatus(null);
  };

  const handleSwitchMode = (newMode: AuthModalMode) => {
    resetMessages();
    setMode(newMode);
  };

  // 1. SIGN IN SUBMIT
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res.success && res.user) {
        setSuccessMessage(res.message);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 600);
      } else if (res.requiresVerification) {
        setErrorMessage(res.message);
        setRegisteredEmail(email.trim().toLowerCase());
        setMode('email-sent');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. REGISTER SUBMIT
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    // Domain validation check
    const domainCheck = authService.validateUtmEmail(email);
    if (!domainCheck.isValid) {
      setErrorMessage(domainCheck.error || 'Please enter a valid UTM email.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.register(name, email, password, faculty, studentId);
      if (res.success) {
        const target = res.email || email.trim().toLowerCase();
        setRegisteredEmail(target);
        // Transition immediately to the email verification confirmation screen
        setMode('email-sent');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // RESEND VERIFICATION EMAIL ACTION
  const handleResendEmail = async () => {
    setResendStatus(null);
    setIsResending(true);
    try {
      const target = registeredEmail || email;
      const res = await authService.resendVerification(target);
      if (res.success) {
        setResendStatus({ 
          type: 'success', 
          message: 'Verification email resent successfully! Please check your inbox and spam folder.' 
        });
      } else {
        setResendStatus({ 
          type: 'error', 
          message: res.message || 'Failed to resend verification email.' 
        });
      }
    } catch (err: any) {
      setResendStatus({ 
        type: 'error', 
        message: err.message || 'Could not resend verification email. Please try again later.' 
      });
    } finally {
      setIsResending(false);
    }
  };

  // MANUAL CHECK VERIFICATION STATUS ACTION
  const handleManualCheckVerification = async () => {
    resetMessages();
    setIsCheckingVerification(true);
    try {
      const target = registeredEmail || email;
      const res = await authService.checkEmailVerificationStatus(target);
      if (res.verified && res.user) {
        setVerifiedSuccessUser(res.user);
        setMode('verified-success');
      } else {
        setErrorMessage(res.message || 'Email not verified yet. Please check your UTM inbox and click the link.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error checking verification status. Please try again.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  // 3. VERIFY EMAIL SUBMIT
  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.verifyEmail(email, verificationCode);
      if (res.success && res.user) {
        setSuccessMessage(res.message);
        setSimulatedInboxPreview(null);
        setTimeout(() => {
          onSuccess(res.user!);
          onClose();
        }, 800);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. RESEND VERIFICATION CODE
  const handleResendCode = async () => {
    resetMessages();
    setIsLoading(true);
    try {
      const res = await authService.resendVerification(email);
      if (res.success) {
        setSuccessMessage(res.message);
        if (res.previewCode) {
          setSimulatedInboxPreview({
            code: res.previewCode,
            targetEmail: email.trim().toLowerCase(),
            type: 'verification',
          });
        }
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not resend code.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. FORGOT PASSWORD SUBMIT
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        setSuccessMessage(res.message);
        if (res.previewCode) {
          setSimulatedInboxPreview({
            code: res.previewCode,
            targetEmail: email.trim().toLowerCase(),
            type: 'reset',
          });
        }
        setMode('reset');
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. RESET PASSWORD SUBMIT
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword(email, verificationCode, newPassword);
      if (res.success) {
        setSuccessMessage(res.message);
        setSimulatedInboxPreview(null);
        setTimeout(() => {
          setMode('login');
          setPassword(newPassword);
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Reset password failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Account Pre-fill Helper
  const fillQuickAccount = (sampleEmail: string, samplePass: string) => {
    setEmail(sampleEmail);
    setPassword(samplePass);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-left my-8">
        
        {/* Header with UTM CampusLoop Branding */}
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 text-white p-6 pb-7">
          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <button 
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-blue-700 flex items-center justify-center shadow-md font-black">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight">
                Campus<span className="text-blue-200">Loop</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-100 bg-white/15 px-2 py-0.5 rounded-full border border-white/20 w-fit">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>UTM Community Only</span>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-black tracking-tight">
            Welcome to CampusLoop
          </h2>
          <p className="text-xs text-blue-100 mt-1 leading-relaxed">
            A marketplace exclusively for the UTM community.
          </p>

          {intendedActionLabel && (
            <div className="mt-3.5 p-2.5 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Sign in required to <strong>{intendedActionLabel}</strong></span>
            </div>
          )}
        </div>

        {/* Note: Approved UTM Email Domains */}
        <div className="px-6 py-2.5 bg-blue-50/80 border-b border-blue-100 flex items-center justify-between text-[11px] text-blue-900">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Allowed: <strong>@graduate.utm.my</strong> &bull; <strong>@student.utm.my</strong> &bull; <strong>@utm.my</strong></span>
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-2 animate-in fade-in-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMessage}</div>
            </div>
          )}

          {/* MODE 1: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  UTM Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@graduate.utm.my"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Please use your approved UTM email address to join CampusLoop.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot')}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                New to CampusLoop?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer"
                >
                  Create Account
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Full Display Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Siti Nur Aisyah"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Official UTM Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aisyah@graduate.utm.my"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Must end with @graduate.utm.my, @student.utm.my, or @utm.my
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Student / Staff ID
                  </label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. A23CS0456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <FacultySelect
                    label="Faculty *"
                    value={faculty}
                    onChange={(val) => setFaculty(val)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Password (min. 8 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-800 leading-relaxed">
                <strong>Email Verification Required:</strong> An activation link and 6-digit code will be sent to your UTM email to verify your status before account activation.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Creating account…</span>
                  </>
                ) : (
                  <>
                    <span>Register as UTM Member</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE: EMAIL VERIFICATION CONFIRMATION SCREEN */}
          {mode === 'email-sent' && (
            <div className="space-y-4 text-xs">
              {/* Success Notification Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-950 space-y-1.5 animate-in fade-in-50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h3 className="font-bold text-sm text-emerald-950">
                    Account Created Successfully!
                  </h3>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed pl-7">
                  We’ve sent a verification link to your UTM email. Please check your inbox and click the link to verify your account.
                </p>
              </div>

              {/* Verification Details & Target Email */}
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100 shadow-2xs">
                  <Mail className="w-6 h-6 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Verification Link Sent To
                  </div>
                  <div className="inline-block px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-mono font-bold text-xs border border-blue-200 break-all shadow-2xs">
                    {registeredEmail || email}
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed max-w-sm mx-auto">
                  Click the link in your email to activate your account. When you return to CampusLoop, we will automatically detect your verified status.
                </p>
              </div>

              {/* Resend Status Message */}
              {resendStatus && (
                <div className={`p-3 rounded-2xl border text-xs flex items-start gap-2 animate-in fade-in-50 ${
                  resendStatus.type === 'success' 
                    ? 'bg-blue-50 border-blue-200 text-blue-800' 
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  {resendStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 leading-relaxed">{resendStatus.message}</div>
                </div>
              )}

              {/* Primary Action: Check Verification Status */}
              <button
                type="button"
                onClick={handleManualCheckVerification}
                disabled={isCheckingVerification}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <RotateCcw className={`w-4 h-4 ${isCheckingVerification ? 'animate-spin' : ''}`} />
                <span>{isCheckingVerification ? 'Checking verification status…' : "I've Verified My Email"}</span>
              </button>

              {/* Secondary Action: Resend Verification Email */}
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isResending}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resending email…</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>

              {/* Back to Login Action */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setMode('login');
                  }}
                  className="font-bold text-xs text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  &larr; Back to Login
                </button>
              </div>
            </div>
          )}

          {/* MODE: VERIFIED SUCCESS */}
          {mode === 'verified-success' && (
            <div className="space-y-4 text-xs text-center py-2 animate-in fade-in-50">
              <div className="w-14 h-14 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  Email Verified Successfully!
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Your CampusLoop account is ready.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                Verified Member: <strong className="font-bold">{registeredEmail || email}</strong>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setMode('login');
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* MODE 3: EMAIL VERIFICATION CODE (FALLBACK) */}
          {mode === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Verify Your UTM Email
                </h3>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">
                  We sent a 6-digit verification code to <strong className="text-slate-800">{email}</strong>
                </p>
              </div>

              <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-100 text-xs space-y-1 text-blue-900 text-center">
                <p className="font-semibold">
                  A verification link or 6-digit code was dispatched to your official UTM inbox.
                </p>
                <p className="text-[11px] text-slate-500">
                  Please check your inbox or spam folder, or click the link in your email.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-center">
                  Enter 6-Digit Verification Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  className="w-full text-center text-xl font-mono tracking-widest py-3 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Verify & Activate Account'}</span>
                <ShieldCheck className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-slate-500 hover:text-slate-800"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE 4: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5 text-xs">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center border border-indigo-100">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Reset Password
                </h3>
                <p className="text-slate-500 text-xs">
                  Enter your registered UTM email to receive a password reset code.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  UTM Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@graduate.utm.my"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{isLoading ? 'Sending Code...' : 'Send Reset Instructions'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-slate-500 hover:text-blue-600 font-semibold"
                >
                  &larr; Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* MODE 5: SET NEW PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-3 text-xs">
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Set New Password
                </h3>
                <p className="text-slate-500 text-xs">
                  Enter the code sent to {email} and pick a new password.
                </p>
              </div>

              {simulatedInboxPreview && (
                <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 text-xs space-y-1.5 text-blue-900">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      <span>UTM Password Reset Preview</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setVerificationCode(simulatedInboxPreview.code)}
                      className="px-2 py-0.5 rounded-lg bg-blue-600 text-white font-bold text-[10px]"
                    >
                      Autofill Code
                    </button>
                  </div>
                  <span className="font-mono text-sm font-black tracking-widest text-blue-700 block">
                    {simulatedInboxPreview.code}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  6-Digit Reset Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center text-lg font-mono tracking-widest py-2 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  New Password (min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Footer Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400">
          CampusLoop is protected by Universiti Teknologi Malaysia (UTM) digital identity standards.
        </div>
      </div>
    </div>
  );
};
