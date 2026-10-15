import React, { useState } from 'react';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { updatePassword } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { formatThaiDate, validatePasswordStrength } from '../utils/security';

export const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, isAdmin, updateUserProfileName } = useAuth();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  const pwdStrength = validatePasswordStrength(newPassword);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim().length < 2) {
      showToast('กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร', 'error');
      return;
    }

    try {
      setIsUpdatingName(true);
      await updateUserProfileName(displayName.trim());
      showToast('อัปเดตชื่อโปรไฟล์สำเร็จแล้ว', 'success');
    } catch {
      showToast('ไม่สามารถอัปเดตชื่อโปรไฟล์ได้', 'error');
    } finally {
      setIsUpdatingName(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPassword.length < 6) {
      setPassError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (!currentUser) return;

    try {
      setIsChangingPass(true);
      await updatePassword(currentUser, newPassword);
      showToast('เปลี่ยนรหัสผ่านสำเร็จแล้ว โปรดใช้รหัสใหม่ในการเข้าสู่ระบบครั้งถัดไป', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('requires-recent-login')) {
        setPassError('เพื่อความปลอดภัย โปรดออกจากระบบและเข้าสู่ระบบใหม่อีกครั้งก่อนเปลี่ยนรหัสผ่าน');
      } else {
        setPassError('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172554] tracking-tight">ข้อมูลส่วนตัว (Profile)</h1>
        <p className="text-xs text-slate-500 mt-1">
          จัดการข้อมูลบัญชีผู้ใช้งาน รหัสผ่าน และการตั้งค่าความปลอดภัย
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Card & Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-[#172554] text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-xs">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#1E293B]">
                {userProfile?.displayName || 'ผู้ใช้งาน'}
              </h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{currentUser?.email}</p>
            </div>

            <div className="pt-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isAdmin
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-[#2563EB] border-blue-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'นักศึกษา (Student)'}</span>
              </span>
            </div>

            <div className="pt-4 border-t border-slate-100 text-left space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span>สถานะบัญชี:</span>
                <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ใช้งานปกติ (Active)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>สมัครสมาชิกเมื่อ:</span>
                <span className="text-slate-800 font-medium">
                  {formatThaiDate(userProfile?.createdAt || currentUser?.metadata.creationTime)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500">
                <span>User UID:</span>
                <span className="font-mono text-[10px] text-slate-600 truncate max-w-[150px]">
                  {currentUser?.uid}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy & Security Shield Note */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 space-y-2 text-xs shadow-xs">
            <div className="flex items-center gap-2 text-[#2563EB] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>การปกป้องข้อมูลส่วนบุคคล (PDPA & OWASP)</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ระบบปกป้องข้อมูลด้วย Zero-Trust Firestore Rules ป้องกันไม่ให้นักศึกษาคนอื่นเข้าถึงงานหรือโปรไฟล์ของคุณ และทำการ Masking อีเมลในระบบตรวจสอบของผู้ดูแล
            </p>
          </div>
        </div>

        {/* Edit Forms Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Edit Display Name */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
            <h3 className="text-sm font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#2563EB]" />
              <span>แก้ไขข้อมูลโปรไฟล์</span>
            </h3>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  ชื่อ - นามสกุล ที่แสดงในระบบ
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl px-4 py-2.5 text-xs text-[#1E293B] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  อีเมล (ไม่สามารถแก้ไขได้เพื่อความปลอดภัย)
                </label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  disabled={isUpdatingName}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isUpdatingName ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs">
            <h3 className="text-sm font-bold text-[#1E293B] mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#2563EB]" />
              <span>เปลี่ยนรหัสผ่าน (Change Password)</span>
            </h3>

            {passError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  รหัสผ่านใหม่
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#1E293B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 absolute right-3.5 top-3 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {newPassword.length > 0 && (
                  <div className="mt-2 text-xs">
                    <span className={`text-[11px] font-medium ${pwdStrength.color}`}>
                      {pwdStrength.label}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  ยืนยันรหัสผ่านใหม่
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#1E293B] transition-colors"
                  />
                </div>
              </div>

              <div className="text-right">
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isChangingPass ? 'กำลังเปลี่ยนรหัส...' : 'อัปเดตรหัสผ่านใหม่'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
