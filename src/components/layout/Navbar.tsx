import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  LogOut,
  User as UserIcon,
  Shield,
  Menu,
  X,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationPage } from '../../types';
import { maskEmail } from '../../utils/security';

interface NavbarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenAddTask: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  onOpenAddTask,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    onNavigate('login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#172554] flex items-center justify-center text-white shadow-sm shadow-blue-950/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-[#172554] flex items-center gap-1.5">
                <span>StudentHub</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                  v1.0
                </span>
              </div>
              <div className="text-[10px] text-slate-500 hidden sm:block">
                Assignment & Task Management System
              </div>
            </div>
          </div>
        </div>

        {/* Center: System Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
          </span>
          <Database className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-700">Cloud Firestore: เชื่อมต่อสำเร็จ</span>
        </div>

        {/* Right: Quick Action & User Menu */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <button
              onClick={onOpenAddTask}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">เพิ่มงานใหม่</span>
            </button>
          )}

          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 border border-[#2563EB]/30 flex items-center justify-center text-[#2563EB] font-bold text-xs uppercase">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                    {userProfile?.displayName || 'ผู้ใช้งาน'}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    {isAdmin ? (
                      <span className="text-amber-600 font-medium flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> แอดมิน
                      </span>
                    ) : (
                      <span>นักศึกษา</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <div className="font-semibold text-slate-800">
                        {userProfile?.displayName || 'นักศึกษา'}
                      </div>
                      <div className="text-slate-500 font-mono text-[11px] truncate mt-0.5">
                        {maskEmail(currentUser.email)}
                      </div>
                      <div className="mt-1.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            isAdmin
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                          }`}
                        >
                          {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'นักศึกษา (Student)'}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigate('profile');
                        }}
                        className="w-full text-left px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>ข้อมูลส่วนตัว (Profile)</span>
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onNavigate('admin-dashboard');
                          }}
                          className="w-full text-left px-4 py-2 text-amber-700 hover:text-amber-900 hover:bg-amber-50/50 flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Shield className="w-4 h-4 text-amber-600" />
                          <span>จัดการระบบ (Admin Dashboard)</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ออกจากระบบ (Logout)</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] transition-colors shadow-sm cursor-pointer"
              >
                สมัครสมาชิก
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
