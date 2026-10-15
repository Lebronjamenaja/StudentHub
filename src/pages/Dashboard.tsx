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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-purple-950/80 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>ยินดีต้อนรับสู่ระบบ StudentHub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              สวัสดี, {userProfile?.displayName || 'นักศึกษา'} 👋
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              ติดตามการบ้าน กำหนดส่งงาน และบริหารจัดการการเรียนอย่างเป็นระเบียบ มีงานรอส่งทั้งหมด{' '}
              <strong className="text-purple-300">{totalTasks - completedTasks}</strong> งาน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAddTask}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-950 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มงานใหม่</span>
            </button>
            <button
              onClick={() => onNavigate('submit')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 text-purple-400" />
              <span>ส่งการบ้าน</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">งานทั้งหมด</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{totalTasks}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>บันทึกในระบบ Firestore</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">กำลังทำ / รอทำ</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {inProgressTasks + pendingTasks}
          </div>
          <div className="text-[11px] text-purple-400 mt-1">
            กำลังทำ {inProgressTasks} • รอดำเนินการ {pendingTasks}
          </div>
        </div>

        {/* Completed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">ส่งแล้ว / สำเร็จ</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">{completedTasks}</div>
          <div className="text-[11px] text-emerald-400 mt-1">
            คิดเป็น {completionRate}% ของทั้งหมด
          </div>
        </div>

        {/* Urgent & Overdue */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">ด่วน / ใกล้ส่ง</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400">{urgentTasks.length}</div>
          <div className="text-[11px] text-rose-400 mt-1">
            กำหนดส่งภายใน 3 วันหรือเกินกำหนด
          </div>
        </div>
      </div>

      {/* Progress & Quick Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-slate-200">ความก้าวหน้าการทำงานโดยรวม</h3>
          </div>
          <span className="text-xs font-bold text-purple-300">{completionRate}% สำเร็จแล้ว</span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Two columns: Urgent deadlines & Recent assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-slate-200">งานที่ใกล้ถึงกำหนด & เกินกำหนด</h3>
              </div>
              <span className="text-xs text-slate-400">{urgentTasks.length} รายการ</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">กำลังโหลดข้อมูล...</div>
            ) : urgentTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
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
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors truncate">
                            {task.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 font-medium">
                            {task.subject}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
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

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-right">
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>ดูงานทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-200">งานที่ต้องส่งเร็ว ๆ นี้</h3>
              </div>
              <span className="text-xs text-slate-400">{upcomingTasks.length} รายการ</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">กำลังโหลดข้อมูล...</div>
            ) : upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                ยังไม่มีงานที่ต้องส่ง สามารถกด "เพิ่มงานใหม่" ได้ทันที
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-950 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-purple-300 transition-colors truncate">
                          {task.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0 font-medium">
                          {task.subject}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3 text-slate-500" />
                        <span>กำหนดส่ง: {formatThaiDate(task.dueDate)}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        task.priority === 'High'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : task.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
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

          <div className="pt-4 mt-4 border-t border-slate-800/80 text-right">
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold inline-flex items-center gap-1 transition-colors"
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
