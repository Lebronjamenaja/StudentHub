import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Flag,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit3,
  Trash2,
  Send,
  AlertTriangle,
  FileText,
  User,
  ShieldAlert
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { useAuth } from '../contexts/AuthContext';
import { Task, NavigationPage } from '../types';
import { formatThaiDate, getTaskUrgency } from '../utils/security';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface TaskDetailsProps {
  taskId: string | null;
  onNavigate: (page: NavigationPage) => void;
  onEditTask: (task: Task) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  taskId,
  onNavigate,
  onEditTask,
}) => {
  const { getTask, deleteTask } = useTasks();
  const { currentUser, isAdmin } = useAuth();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const task = taskId ? getTask(taskId) : undefined;

  if (!task) {
    return (
      <div className="py-20 text-center bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-200">ไม่พบข้อมูลงานที่ต้องการ</h2>
        <p className="text-xs text-slate-400 mt-1">งานนี้อาจถูกลบไปแล้ว หรือคุณไม่มีสิทธิ์เข้าถึง</p>
        <button
          onClick={() => onNavigate('tasks')}
          className="mt-5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors"
        >
          กลับไปหน้ารายการงาน
        </button>
      </div>
    );
  }

  // Authorization check: student can only view their own task unless admin
  const isOwner = currentUser?.uid === task.ownerUid;
  const canModify = isOwner || isAdmin;

  const urgency = getTaskUrgency(task.dueDate, task.status);
  const isCompleted = task.status === 'Completed';

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      setIsDeleteModalOpen(false);
      onNavigate('tasks');
    } catch {
      // Handled
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top back button & action buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('tasks')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับไปงานของฉัน</span>
        </button>

        {canModify && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditTask(task)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไขงาน</span>
            </button>
            <button
              onClick={() => onNavigate('submit')}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all flex items-center gap-1.5 shadow-md shadow-purple-950"
            >
              <Send className="w-3.5 h-3.5" />
              <span>ส่งการบ้านนี้</span>
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="ลบงานนี้"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Details Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Header Section */}
        <div className="space-y-3 pb-6 border-b border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{task.subject}</span>
            </span>

            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                task.priority === 'High'
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : task.priority === 'Medium'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              ระดับความสำคัญ: {task.priority === 'High' ? 'ด่วนมาก' : task.priority === 'Medium' ? 'ปานกลาง' : 'ทั่วไป'}
            </span>

            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                isCompleted
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : task.status === 'In Progress'
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isCompleted ? 'ส่งเรียบร้อยแล้ว' : task.status === 'In Progress' ? 'กำลังทำ' : 'รอดำเนินการ'}</span>
            </span>

            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${urgency.badgeColor}`}>
              {urgency.badgeLabel}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {task.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>กำหนดส่ง: <strong className="text-slate-200">{formatThaiDate(task.dueDate)}</strong></span>
            </div>
            <span>•</span>
            <div>
              สร้างเมื่อ: {formatThaiDate(task.createdAt, true)}
            </div>
          </div>
        </div>

        {/* Task Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-500" />
            <span>รายละเอียดคำสั่งและข้อกำหนด</span>
          </h3>
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
            {task.description || 'ไม่มีคำอธิบายหรือรายละเอียดเพิ่มเติมสำหรับงานนี้'}
          </div>
        </div>

        {/* Submission Details Section */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Send className="w-4 h-4 text-purple-400" />
            <span>ข้อมูลการส่งงาน (Assignment Submission)</span>
          </h3>

          {task.submissionUrl ? (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> ส่งงานแล้วเมื่อ {formatThaiDate(task.submittedAt, true)}
                </span>
                <a
                  href={task.submissionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>เปิดไฟล์งาน / แหล่งเก็บงาน</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div>
                <div className="text-[11px] text-slate-400 mb-1">ลิงก์ที่ส่ง:</div>
                <div className="font-mono text-xs text-slate-300 break-all bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  {task.submissionUrl}
                </div>
              </div>

              {task.submissionNote && (
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">ข้อความเพิ่มเติม:</div>
                  <div className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                    {task.submissionNote}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2">
              <p className="text-xs text-slate-400">ยังไม่มีการส่งงานสำหรับการบ้านนี้</p>
              <button
                onClick={() => onNavigate('submit')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>ส่งงานตอนนี้</span>
              </button>
            </div>
          )}
        </div>

        {/* Security & Access Audit Metadata */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>Task ID: <code className="font-mono text-slate-400">{task.id}</code></span>
          <span>เข้าถึงตามสิทธิ์: <code className="font-mono text-slate-400">{isOwner ? 'Owner (UID Verified)' : 'Admin Access'}</code></span>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="ยืนยันการลบงาน?"
        message={`ต้องการลบงาน "${task.title}" หรือไม่? ข้อมูลทั้งหมดรวมถึงบันทึกการส่งจะถูกลบอย่างถาวร`}
        confirmText="ลบงานนี้"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
