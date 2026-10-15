import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { NavigationPage } from '../types';

interface ForbiddenPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const ForbiddenPage: React.FC<ForbiddenPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white border border-rose-200 rounded-3xl p-8 shadow-xs text-center space-y-6 relative overflow-hidden">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 border border-rose-200/80 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>HTTP 403 — ACCESS FORBIDDEN</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172554] tracking-tight">
            ไม่มีสิทธิ์เข้าถึงหน้านี้
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            คุณไม่มีสิทธิ์ในการเข้าถึงทรัพยากรหรือหน้านี้ เนื่องจากเนื้อหาดังกล่าวสงวนไว้สำหรับ{' '}
            <strong className="text-rose-600">ผู้ดูแลระบบ (Admin)</strong> หรือเจ้าของข้อมูลเท่านั้น (Zero-Trust RBAC Violation Guard)
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-left space-y-1">
          <div className="font-semibold text-slate-800">เหตุผลทางความปลอดภัย:</div>
          <ul className="list-disc list-inside space-y-0.5 text-[10px]">
            <li>บัญชีปัจจุบันมีบทบาทเป็น นักศึกษา (Student)</li>
            <li>การเข้าถึงฐานข้อมูลถูกจำกัดด้วย Cloud Firestore Security Rules</li>
            <li>ไม่สามารถยกระดับสิทธิ์ผ่าน Client ได้</li>
          </ul>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] active:bg-[#172554] transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>กลับสู่หน้าแดชบอร์ด</span>
          </button>
        </div>
      </div>
    </div>
  );
};
