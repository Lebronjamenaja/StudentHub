import React from 'react';
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Send,
  ArrowRight,
  Calendar,
  BookOpen,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { NavigationPage } from '../types';
import { formatThaiDate, getTaskUrgency } from '../utils/security';

interface DashboardProps {
  onNavigate: (page: NavigationPage) => void;
  onSelectTask: (taskId: string) => void;
  onOpenAddTask: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigate,
  onSelectTask,
  onOpenAddTask,
}) => {
  const { userProfile } = useAuth();
  const { tasks, loading } = useTasks();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'Pending').length;

  const urgentTasks = tasks.filter((t) => {
    if (t.status === 'Completed') return false;
    const { isUrgent, isOverdue } = getTaskUrgency(t.dueDate, t.status);
    return isUrgent || isOverdue;
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Upcoming 5 tasks sorted by due date
  const upcomingTasks = [...tasks]
    .filter((t) => t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#2563EB] border border-blue-900/30 p-6 sm:p-8 shadow-sm text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>ยินดีต้อนรับสู่ระบบ StudentHub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              สวัสดี, {userProfile?.displayName || 'นักศึกษา'} 👋
            </h1>
            <p className="text-sm text-blue-100 max-w-xl leading-relaxed">
              ติดตามการบ้าน กำหนดส่งงาน และบริหารจัดการการเรียนอย่างเป็นระเบียบ มีงานรอส่งทั้งหมด{' '}
              <strong className="text-white font-bold">{totalTasks - completedTasks}</strong> งาน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddTask}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#172554] bg-white hover:bg-slate-100 shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#2563EB]" />
              <span>เพิ่มงานใหม่</span>
            </button>
            <button
              onClick={() => onNavigate('submit')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-white" />
              <span>ส่งการบ้าน</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">งานทั้งหมด</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200/60">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B]">{totalTasks}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>บันทึกในระบบ Firestore</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">กำลังทำ / รอทำ</span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#7C3AED] border border-purple-200/60">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B]">
            {inProgressTasks + pendingTasks}
          </div>
          <div className="text-[11px] text-[#7C3AED] font-medium mt-1">
            กำลังทำ {inProgressTasks} • รอดำเนินการ {pendingTasks}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">ส่งแล้ว / สำเร็จ</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B]">{completedTasks}</div>
          <div className="text-[11px] text-[#16A34A] font-medium mt-1">
            คิดเป็น {completionRate}% ของทั้งหมด
          </div>
        </div>

        {/* Urgent & Overdue */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">ด่วน / ใกล้ส่ง</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-600">{urgentTasks.length}</div>
          <div className="text-[11px] text-rose-600 mt-1">
            กำหนดส่งภายใน 3 วันหรือเกินกำหนด
          </div>
        </div>
      </div>

      {/* Progress & Quick Overview */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
            <h3 className="text-sm font-bold text-[#1E293B]">ความก้าวหน้าการทำงานโดยรวม</h3>
          </div>
          <span className="text-xs font-bold text-[#2563EB]">{completionRate}% สำเร็จแล้ว</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Two columns: Urgent deadlines & Recent assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-[#1E293B]">งานที่ใกล้ถึงกำหนด & เกินกำหนด</h3>
              </div>
              <span className="text-xs text-slate-500">{urgentTasks.length} รายการ</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">กำลังโหลดข้อมูล...</div>
            ) : urgentTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ไม่มีงานเร่งด่วนในขณะนี้ จัดการเวลาได้ยอดเยี่ยม! ✨
              </div>
            ) : (
              <div className="space-y-2.5">
                {urgentTasks.slice(0, 4).map((task) => {
                  const urgency = getTaskUrgency(task.dueDate, task.status);
                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-[#2563EB]/40 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#1E293B] group-hover:text-[#2563EB] transition-colors truncate">
                            {task.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 shrink-0 font-medium">
                            {task.subject}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>กำหนดส่ง: {formatThaiDate(task.dueDate)}</span>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${urgency.badgeColor}`}
                      >
                        {urgency.badgeLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-[#2563EB] hover:text-[#172554] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>ดูงานทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-[#1E293B]">งานที่ต้องส่งเร็ว ๆ นี้</h3>
              </div>
              <span className="text-xs text-slate-500">{upcomingTasks.length} รายการ</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400 text-xs">กำลังโหลดข้อมูล...</div>
            ) : upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                ยังไม่มีงานที่ต้องส่ง สามารถกด "เพิ่มงานใหม่" ได้ทันที
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-[#2563EB]/40 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#1E293B] group-hover:text-[#2563EB] transition-colors truncate">
                          {task.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/70 text-slate-700 shrink-0 font-medium">
                          {task.subject}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        <span>กำหนดส่ง: {formatThaiDate(task.dueDate)}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        task.priority === 'High'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {task.priority === 'High'
                        ? 'ด่วนมาก'
                        : task.priority === 'Medium'
                        ? 'ปานกลาง'
                        : 'ทั่วไป'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-[#2563EB] hover:text-[#172554] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>ไปยังหน้างานของฉัน</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
