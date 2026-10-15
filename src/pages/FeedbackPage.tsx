import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  Bug,
  Lightbulb,
  Palette,
  Shield,
  HelpCircle,
  Clock
} from 'lucide-react';
import { collection, query, where, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Feedback, FeedbackCategory } from '../types';
import { sanitizeText, maskEmail, formatThaiDate } from '../utils/security';

export const FeedbackPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('bug');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myFeedbacks, setMyFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to feedbacks created by current user
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);

    const q = query(collection(db, 'feedbacks'), where('userUid', '==', currentUser.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Feedback[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as Feedback);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setMyFeedbacks(list);
        setLoading(false);
      },
      (err) => {
        console.error('Feedback snapshot listener error:', err);
        handleFirestoreError(err, OperationType.LIST, 'feedbacks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTitle = sanitizeText(title);
    const cleanDetails = sanitizeText(details);

    if (cleanTitle.length < 2) {
      setError('กรุณากรอกหัวข้ออย่างน้อย 2 ตัวอักษร');
      return;
    }
    if (cleanDetails.length < 5) {
      setError('กรุณากรอกรายละเอียดอย่างน้อย 5 ตัวอักษร');
      return;
    }
    if (!currentUser) {
      setError('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ');
      return;
    }

    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const newFeedback: Feedback = {
      id: feedbackId,
      userUid: currentUser.uid,
      userEmailMasked: maskEmail(currentUser.email),
      title: cleanTitle,
      category,
      details: cleanDetails,
      status: 'pending',
      createdAt: nowIso,
    };

    try {
      setIsSubmitting(true);
      await setDoc(doc(db, 'feedbacks', feedbackId), newFeedback);
      showToast('ส่งข้อเสนอแนะเรียบร้อยแล้ว ขอบคุณสำหรับข้อมูล!', 'success');
      setTitle('');
      setDetails('');
      setCategory('bug');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryMap: Record<FeedbackCategory, { label: string; icon: React.ElementType; color: string }> = {
    bug: { label: 'แจ้งข้อผิดพลาด (Bug Report)', icon: Bug, color: 'text-rose-400' },
    feature: { label: 'ขอฟีเจอร์ใหม่ (Feature Request)', icon: Lightbulb, color: 'text-amber-400' },
    ui: { label: 'การใช้งาน / การออกแบบ (UI/UX)', icon: Palette, color: 'text-purple-400' },
    security: { label: 'ความปลอดภัยระบบ (Security)', icon: Shield, color: 'text-emerald-400' },
    general: { label: 'ข้อเสนอแนะทั่วไป (General)', icon: HelpCircle, color: 'text-blue-400' },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          ส่งข้อเสนอแนะ / แจ้งปัญหา (Feedback)
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          ช่วยเราพัฒนา StudentHub ให้ดียิ่งขึ้น แจ้งบั๊ก ปัญหาความปลอดภัย หรือข้อเสนอแนะของคุณ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form 3 Column */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
          <h2 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-purple-400" />
            <span>แบบฟอร์มส่งข้อเสนอแนะ</span>
          </h2>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                หมวดหมู่ข้อเสนอแนะ <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 transition-colors cursor-pointer appearance-none"
              >
                <option value="bug">แจ้งข้อผิดพลาด (Bug Report)</option>
                <option value="feature">ขอฟีเจอร์ใหม่ (Feature Request)</option>
                <option value="ui">การใช้งาน / การออกแบบ (UI/UX)</option>
                <option value="security">ความปลอดภัยระบบ (Security Testing)</option>
                <option value="general">ข้อเสนอแนะทั่วไป (General)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                หัวข้อเรื่อง <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น พบปัญหาปุ่มบันทึกไม่ตอบสนอง, อยากให้มีฟังก์ชันแจ้งเตือนผ่านอีเมล"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                รายละเอียด <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                required
                maxLength={2000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="อธิบายขั้นตอนที่ทำให้เกิดปัญหา หรือข้อเสนอแนะโดยละเอียด..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 transition-colors resize-none"
              />
              <div className="text-right text-[11px] text-slate-500 mt-1">
                {details.length}/2000
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                อีเมลของคุณจะถูกปกปิด (Data Masking) ในมุมมอง Admin
              </span>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-950 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ส่งข้อเสนอแนะ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Previous Submissions Column */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>ประวัติข้อเสนอแนะของคุณ</span>
            <span className="text-xs text-slate-400 font-normal">
              {myFeedbacks.length} รายการ
            </span>
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">กำลังโหลดข้อมูล...</div>
          ) : myFeedbacks.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">คุณยังไม่เคยส่งข้อเสนอแนะ</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {myFeedbacks.map((item) => {
                const cat = categoryMap[item.category] || categoryMap.general;
                const Icon = cat.icon;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-semibold flex items-center gap-1.5 ${cat.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span>{cat.label.split(' ')[0]}</span>
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          item.status === 'resolved'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : item.status === 'reviewed'
                            ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {item.status === 'resolved'
                          ? 'แก้ไขแล้ว'
                          : item.status === 'reviewed'
                          ? 'กำลังตรวจสอบ'
                          : 'รอดำเนินการ'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed">
                      {item.details}
                    </p>

                    <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {formatThaiDate(item.createdAt, true)}
                      </span>
                      <span className="font-mono">{item.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
