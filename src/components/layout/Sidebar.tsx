import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Send,
  MessageSquare,
  User,
  Shield,
  Users,
  BarChart3,
  Lock,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NavigationPage } from '../../types';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { isAdmin } = useAuth();

  const navItems = [
    { id: 'dashboard' as NavigationPage, label: 'แดชบอร์ด', icon: LayoutDashboard },
    { id: 'tasks' as NavigationPage, label: 'งานของฉัน', icon: CheckSquare },
    { id: 'submit' as NavigationPage, label: 'ส่งงาน', icon: Send },
    { id: 'feedback' as NavigationPage, label: 'ส่งข้อเสนอแนะ / ปัญหา', icon: MessageSquare },
    { id: 'profile' as NavigationPage, label: 'ข้อมูลส่วนตัว', icon: User },
  ];

  const adminItems = [
    { id: 'admin-dashboard' as NavigationPage, label: 'ภาพรวมระบบ Admin', icon: BarChart3 },
    { id: 'admin-users' as NavigationPage, label: 'จัดการสมาชิก & ผู้ใช้', icon: Users },
  ];

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900/95 lg:bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              เมนูหลัก (STUDENT)
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600/15 text-purple-300 border border-purple-500/30 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Navigation */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-800/80">
              <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                <span>สำหรับผู้ดูแล (ADMIN)</span>
              </div>
              <nav className="space-y-1">
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                          : 'text-slate-400 hover:text-amber-200/90 hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>

        {/* Security / System compliance info card */}
        <div className="pt-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Trust ABAC Guard</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[10px]">
              ป้องกัน IDOR & Data Leakage ด้วย Firebase Security Rules แยกตาม UID
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
