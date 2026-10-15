import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { NavigationPage } from '../types';
import { validatePasswordStrength } from '../utils/security';

interface RegisterProps {
  onNavigate: (page: NavigationPage) => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
  const { register, error: authError, clearError } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const pwdStrength = validatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!displayName.trim() || displayName.trim().length < 2) {
      setLocalError('กรุณากรอกชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setLocalError('กรุณากรอกรูปแบบอีเมลให้ถูกต้อง');
      return;
    }
    if (password.length < 6) {
      setLocalError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);
      await register(displayName, email, password);
      showToast('สมัครสมาชิกสำเร็จ! บทบาทนักศึกษาเริ่มต้นพร้อมใช้งาน', 'success');
      onNavigate('dashboard');
    } catch {
      // Error handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs relative overflow-hidden">
        <div className="mb-6">
          <button
            onClick={() => onNavigate('login')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#172554] transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>กลับไปหน้าเข้าสู่ระบบ</span>
          </button>
          <h1 className="text-2xl font-bold text-[#172554] tracking-tight">สร้างบัญชีนักศึกษาใหม่</h1>
          <p className="text-xs text-slate-500 mt-1">
            ลงทะเบียนเพื่อจัดการการบ้านและกำหนดส่งงานของคุณ
          </p>
        </div>

        {displayError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="leading-tight">{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              ชื่อ - นามสกุล <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                maxLength={100}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี หรือ Somchai Jaidee"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1E293B] placeholder-slate-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              อีเมล <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.ac.th"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1E293B] placeholder-slate-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              รหัสผ่าน <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#1E293B] placeholder-slate-400 transition-colors"
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

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500">ระดับความปลอดภัย:</span>
                  <span className={`text-[11px] font-semibold ${pwdStrength.color}`}>
                    {pwdStrength.label}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      pwdStrength.score === 1
                        ? 'w-1/4 bg-amber-500'
                        : pwdStrength.score === 2
                        ? 'w-2/4 bg-[#2563EB]'
                        : pwdStrength.score === 4
                        ? 'w-full bg-[#16A34A]'
                        : 'w-1/12 bg-rose-500'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านซ้ำอีกครั้ง"
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#1E293B] placeholder-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Zero-trust Role note */}
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
            <span>
              ตามมาตรฐานความปลอดภัย บัญชีใหม่ทุกบัญชีจะถูกกำหนดบทบาทเป็น <strong className="text-[#172554]">นักศึกษา (Student)</strong> โดยอัตโนมัติ ไม่สามารถเปลี่ยนแปลงผ่าน Client ได้
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] active:bg-[#172554] transition-all shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>สมัครสมาชิก</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
          <button
            type="button"
            onClick={() => onNavigate('login')}
            className="text-[#2563EB] hover:text-[#172554] font-semibold transition-colors cursor-pointer"
          >
            เข้าสู่ระบบที่นี่
          </button>
        </div>
      </div>
    </div>
  );
};
