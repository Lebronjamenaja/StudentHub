import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { NavigationPage } from '../types';

interface ForbiddenPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Ambient red glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>HTTP 403 — ACCESS FORBIDDEN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ไม่มีสิทธิ์เข้าถึงหน้านี้
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            คุณไม่มีสิทธิ์ในการเข้าถึงทรัพยากรหรือหน้านี้ เนื่องจากเนื้อหาดังกล่าวสงวนไว้สำหรับ{' '}
            <strong className="text-rose-300">ผู้ดูแลระบบ (Admin)</strong> หรือเจ้าของข้อมูลเท่านั้น (Zero-Trust RBAC Violation Guard)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
          <div className="font-semibold text-slate-300">เหตุผลทางความปลอดภัย:</div>
          <ul className="list-disc list-inside space-y-0.5 text-[10px]">
            <li>บัญชีปัจจุบันมีบทบาทเป็น นักศึกษา (Student)</li>
            <li>การเข้าถึงฐานข้อมูลถูกจำกัดด้วย Cloud Firestore Security Rules</li>
            <li>ไม่สามารถยกระดับสิทธิ์ผ่าน Client ได้</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-950 flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>กลับสู่หน้าแดชบอร์ด</span>
          </button>
        </div>
      </div>
    </div>
  );
};
