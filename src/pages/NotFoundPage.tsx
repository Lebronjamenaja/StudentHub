import React from 'react';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';
import { NavigationPage } from '../types';

interface NotFoundPageProps {
  onNavigate: (page: NavigationPage) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto shadow-inner">
          <HelpCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
            <span>HTTP 404 — NOT FOUND</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ไม่พบหน้าที่คุณต้องการ
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            หน้าที่คุณกำลังพยายามเข้าถึงอาจถูกย้าย ลบออกไป หรือ URL ไม่ถูกต้อง
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-950 flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>กลับหน้าหลัก (Dashboard)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
