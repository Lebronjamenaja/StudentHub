import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, GraduationCap, ArrowRight, AlertCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { NavigationPage } from '../types';

interface LoginProps {
  onNavigate: (page: NavigationPage) => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle, error: authError, clearError } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email.trim() || !password) {
      setLocalError('กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับกลับ!', 'success');
      onNavigate('dashboard');
    } catch {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await loginWithGoogle();
      showToast('เข้าสู่ระบบด้วย Google สำเร็จ!', 'success');
      onNavigate('dashboard');
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs relative overflow-hidden">
        <div className="relative text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-[#172554] border border-blue-200/60 mb-3 shadow-xs">
            <GraduationCap className="w-8 h-8 text-[#172554]" />
          </div>
          <h1 className="text-2xl font-bold text-[#172554] tracking-tight">เข้าสู่ระบบ StudentHub</h1>
          <p className="text-xs text-slate-500 mt-1">
            ระบบจัดการงานและกำหนดส่งงานสำหรับนักศึกษา
          </p>
        </div>

        {displayError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-tight flex-1">{displayError}</span>
            </div>
            {displayError.includes('Firebase Console') && (
              <div className="pt-2 border-t border-rose-200 flex justify-end">
                <a
                  href="https://console.firebase.google.com/project/studenthub-62716/authentication/providers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 text-[11px] font-semibold transition-colors"
                >
                  <span>เปิดหน้าเปิดใช้งาน Email/Password</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              อีเมลมหาวิทยาลัย / ส่วนตัว
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.ac.th"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1E293B] placeholder-slate-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#1E293B] placeholder-slate-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-3 transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
              </>
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">หรือ</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all flex items-center justify-center gap-2.5 shadow-xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>เข้าสู่ระบบด้วย Google Account</span>
        </button>

        <div className="mt-6 text-center text-xs text-slate-500">
          ยังไม่มีบัญชีผู้ใช้งาน?{' '}
          <button
            type="button"
            onClick={() => onNavigate('register')}
            className="text-[#2563EB] hover:text-[#172554] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>สมัครสมาชิกใหม่</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
