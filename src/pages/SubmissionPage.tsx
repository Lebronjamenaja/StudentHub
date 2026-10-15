import React, { useState, useEffect } from 'react';
import {
  Send,
  Link as LinkIcon,
  FileText,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { useToast } from '../contexts/ToastContext';
import { NavigationPage } from '../types';
import { isValidHttpUrl, formatThaiDate } from '../utils/security';

interface SubmissionPageProps {
  onNavigate: (page: NavigationPage) => void;
  onSelectTask: (taskId: string) => void;
  preselectedTaskId?: string | null;
}

export const SubmissionPage: React.FC<SubmissionPageProps> = ({
  onNavigate,
  onSelectTask,
  preselectedTaskId,
}) => {
  const { tasks, submitAssignment } = useTasks();
  const { showToast } = useToast();

  const [selectedTaskId, setSelectedTaskId] = useState<string>(preselectedTaskId || '');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionNote, setSubmissionNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTaskId, setSuccessTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedTaskId) {
      setSelectedTaskId(preselectedTaskId);
    } else if (tasks.length > 0 && !selectedTaskId) {
      // Pick first non-completed task or first task
      const firstPending = tasks.find((t) => t.status !== 'Completed');
      setSelectedTaskId(firstPending ? firstPending.id : tasks[0].id);
    }
  }, [preselectedTaskId, tasks]);

  // When task changes, populate existing submission details if any
  useEffect(() => {
    if (selectedTaskId) {
      const current = tasks.find((t) => t.id === selectedTaskId);
      if (current?.submissionUrl) {
        setSubmissionUrl(current.submissionUrl);
        setSubmissionNote(current.submissionNote || '');
      } else {
        setSubmissionUrl('');
        setSubmissionNote('');
      }
    }
  }, [selectedTaskId, tasks]);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTaskId) {
      setError('กรุณาเลือกงานที่ต้องการส่ง');
      return;
    }

    if (!submissionUrl.trim()) {
      setError('กรุณาระบุ URL แหล่งเก็บงานหรือไฟล์ส่งงาน');
      return;
    }

    if (!isValidHttpUrl(submissionUrl.trim())) {
      setError('รูปแบบ URL ไม่ถูกต้อง ต้องขึ้นต้นด้วย http:// หรือ https:// เช่น https://github.com/... หรือ https://drive.google.com/...');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitAssignment(selectedTaskId, submissionUrl.trim(), submissionNote.trim());
      setSuccessTaskId(selectedTaskId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งงาน');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="py-20 text-center bg-white border border-slate-200/80 rounded-3xl p-8 max-w-lg mx-auto shadow-xs">
        <Send className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#1E293B]">ยังไม่มีงานในระบบ</h2>
        <p className="text-xs text-slate-500 mt-1">
          คุณต้องเพิ่มงานก่อน จึงจะสามารถส่งการบ้านได้
        </p>
        <button
          onClick={() => onNavigate('tasks')}
          className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] transition-colors cursor-pointer"
        >
          ไปยังหน้างานของฉันเพื่อเพิ่มงาน
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#172554] tracking-tight">ส่งงาน (Assignment Submission)</h1>
        <p className="text-xs text-slate-500 mt-1">
          ฟอร์มส่งไฟล์งานและลิงก์การบ้าน พร้อมระบบบันทึกเวลาและตรวจสอบความถูกต้องของข้อมูล
        </p>
      </div>

      {successTaskId ? (
        <div className="bg-white border border-emerald-300 rounded-3xl p-8 shadow-xs text-center space-y-4 animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#1E293B]">บันทึกการส่งงานสำเร็จเรียบร้อย!</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            งาน <strong>"{selectedTask?.title}"</strong> ได้รับการปรับปรุงสถานะเป็น <strong>เสร็จสมบูรณ์ (Completed)</strong> และบันทึกลงใน Firestore เรียบร้อยแล้ว
          </p>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={() => onSelectTask(successTaskId)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#16A34A] hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>ดูรายละเอียดงานที่ส่ง</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setSuccessTaskId(null);
                setSubmissionUrl('');
                setSubmissionNote('');
              }}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              ส่งงานอื่นต่อ
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Select Task */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                เลือกงานที่ต้องการส่ง <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl px-4 py-3 text-xs text-[#1E293B] transition-colors cursor-pointer appearance-none"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.subject}] {t.title} — กำหนดส่ง {formatThaiDate(t.dueDate)} (สถานะ: {t.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Task Overview Preview */}
            {selectedTask && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2563EB] flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>วิชา: {selectedTask.subject}</span>
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> กำหนดส่ง: {formatThaiDate(selectedTask.dueDate)}
                  </span>
                </div>
                {selectedTask.description && (
                  <p className="text-slate-600 line-clamp-2 text-[11px]">
                    {selectedTask.description}
                  </p>
                )}
                {selectedTask.status === 'Completed' && (
                  <div className="text-[11px] text-[#16A34A] font-medium flex items-center gap-1 pt-1 border-t border-slate-200">
                    <CheckCircle2 className="w-3 h-3" /> งานนี้เคยส่งแล้วเมื่อ {formatThaiDate(selectedTask.submittedAt, true)} (สามารถส่งแก้ไขใหม่ได้)
                  </div>
                )}
              </div>
            )}

            {/* 2. Submission URL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                URL ของไฟล์หรือแหล่งเก็บงาน (Google Drive, GitHub, OneDrive, Figma ฯลฯ) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  required
                  maxLength={500}
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  placeholder="https://github.com/username/project หรือ https://drive.google.com/..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl pl-10 pr-4 py-3 text-xs text-[#1E293B] placeholder-slate-400 transition-colors font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ระบบจะตรวจสอบความถูกต้องของ URL ก่อนบันทึก เพื่อป้องกันข้อผิดพลาดและความปลอดภัย
              </p>
            </div>

            {/* 3. Submission Note */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                ข้อความประกอบการส่ง / รายละเอียดเพิ่มเติม (Submission Note)
              </label>
              <div className="relative">
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={submissionNote}
                  onChange={(e) => setSubmissionNote(e.target.value)}
                  placeholder="เช่น ข้อแนะนำในการรันโค้ด, รายชื่อสมาชิกในกลุ่ม, หมายเหตุสิ่งที่ทำเพิ่มเติม..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl p-3.5 text-xs text-[#1E293B] placeholder-slate-400 transition-colors resize-none"
                />
              </div>
              <div className="text-right text-[11px] text-slate-400 mt-1">
                {submissionNote.length}/1000
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => onNavigate('tasks')}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] transition-all shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังส่งงาน...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>ยืนยันการส่งงาน</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
