import React, { useState, useEffect } from 'react';
import { X, Calendar, BookOpen, FileText, Flag, CheckCircle2, AlertCircle } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    subject: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
  }) => Promise<void>;
  initialData?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setSubject(initialData.subject || '');
      setDescription(initialData.description || '');
      setDueDate(initialData.dueDate || '');
      setPriority(initialData.priority || 'Medium');
      setStatus(initialData.status || 'Pending');
    } else {
      // Default to today + 7 days
      const d = new Date();
      d.setDate(d.getDate() + 7);
      const defaultDate = d.toISOString().split('T')[0];

      setTitle('');
      setSubject('');
      setDescription('');
      setDueDate(defaultDate);
      setPriority('Medium');
      setStatus('Pending');
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.trim().length < 2) {
      setError('กรุณาระบุชื่องานอย่างน้อย 2 ตัวอักษร');
      return;
    }
    if (!subject.trim()) {
      setError('กรุณาระบุรายวิชา');
      return;
    }
    if (!dueDate) {
      setError('กรุณาเลือกวันกำหนดส่งงาน');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        dueDate,
        priority,
        status,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {initialData ? 'แก้ไขงาน / การบ้าน' : 'เพิ่มงาน / การบ้านใหม่'}
              </h2>
              <p className="text-xs text-slate-400">กรอกข้อมูลและกำหนดส่งงานให้ครบถ้วน</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              ชื่องาน / หัวข้อการบ้าน <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น รายงาน Final Project, การบ้านแบบฝึกหัดบทที่ 4"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                รายวิชา / รหัสวิชา <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="เช่น CS301 Web App, SWE202"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                วันกำหนดส่ง (Due Date) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                ระดับความสำคัญ (Priority)
              </label>
              <div className="relative">
                <Flag className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 transition-colors appearance-none cursor-pointer"
                >
                  <option value="Low">ต่ำ (Low Priority)</option>
                  <option value="Medium">ปานกลาง (Medium)</option>
                  <option value="High">สูงมาก / ด่วน (High Priority)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                สถานะการทำงาน (Status)
              </label>
              <div className="relative">
                <CheckCircle2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 transition-colors appearance-none cursor-pointer"
                >
                  <option value="Pending">รอดำเนินการ (Pending)</option>
                  <option value="In Progress">กำลังทำ (In Progress)</option>
                  <option value="Completed">เสร็จสมบูรณ์ (Completed)</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              คำอธิบายรายละเอียดงาน (ไม่เกิน 2,000 ตัวอักษร)
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุข้อกำหนด เกณฑ์การให้คะแนน ลิงก์เอกสารประกอบ หรือสิ่งที่ต้องทำ..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 transition-colors resize-none"
            />
            <div className="text-right text-[11px] text-slate-500 mt-1">
              {description.length}/2000
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-md shadow-purple-950 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>{initialData ? 'บันทึกการแก้ไข' : 'เพิ่มงาน'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
