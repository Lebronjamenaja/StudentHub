import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Grid,
  List as ListIcon,
  Trash2,
  Edit3,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpDown,
  CheckSquare
} from 'lucide-react';
import { useTasks } from '../contexts/TaskContext';
import { Task, TaskPriority, TaskStatus, NavigationPage } from '../types';
import { formatThaiDate, getTaskUrgency } from '../utils/security';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { CalendarView } from '../components/tasks/CalendarView';

interface MyTasksProps {
  onSelectTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onOpenAddTask: () => void;
  onNavigate: (page: NavigationPage) => void;
}

export const MyTasks: React.FC<MyTasksProps> = ({
  onSelectTask,
  onEditTask,
  onOpenAddTask,
  onNavigate,
}) => {
  const { tasks, deleteTask, loading } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('list');

  // Delete modal state
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description || '').toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortOrder]);

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;
    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
    } catch {
      // Handled in context
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#172554] tracking-tight">งานของฉัน (My Tasks)</h1>
          <p className="text-xs text-slate-500 mt-1">
            ค้นหา กรอง และติดตามสถานะการบ้านและการส่งงานทั้งหมดของคุณ
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#172554] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="มุมมองรายการ"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[#172554] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="มุมมองการ์ด"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#172554] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="มุมมองปฏิทิน"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={onOpenAddTask}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>เพิ่มงานใหม่</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามชื่องาน, รายวิชา..."
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl pl-10 pr-4 py-2 text-xs text-[#1E293B] placeholder-slate-400 transition-colors"
            />
          </div>

          {/* Status filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl px-3 py-2 text-xs text-[#1E293B] transition-colors cursor-pointer"
            >
              <option value="ALL">สถานะทั้งหมด</option>
              <option value="Pending">รอดำเนินการ (Pending)</option>
              <option value="In Progress">กำลังทำ (In Progress)</option>
              <option value="Completed">เสร็จสมบูรณ์ / ส่งแล้ว</option>
            </select>
          </div>

          {/* Priority filter */}
          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] focus:bg-white rounded-xl px-3 py-2 text-xs text-[#1E293B] transition-colors cursor-pointer"
            >
              <option value="ALL">ความสำคัญทั้งหมด</option>
              <option value="High">สูงมาก / ด่วน</option>
              <option value="Medium">ปานกลาง</option>
              <option value="Low">ต่ำ</option>
            </select>
          </div>

          {/* Sort order */}
          <div className="md:col-span-2">
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>{sortOrder === 'asc' ? 'ส่งก่อน - หลัง' : 'ส่งหลัง - ก่อน'}</span>
            </button>
          </div>
        </div>

        {/* Filter count summary */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
          <span>พบ {filteredTasks.length} จากทั้งหมด {tasks.length} งาน</span>
          {(searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setPriorityFilter('ALL');
              }}
              className="text-[#2563EB] hover:text-[#172554] font-medium transition-colors cursor-pointer"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Main View Display */}
      {viewMode === 'calendar' ? (
        <CalendarView tasks={filteredTasks} onSelectTask={onSelectTask} />
      ) : loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">กำลังโหลดข้อมูลงาน...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 text-center bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-[#1E293B]">ไม่พบรายการงานที่ค้นหา</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือคลิกปุ่มด้านล่างเพื่อเพิ่มการบ้านหรืองานใหม่ลงในระบบ
          </p>
          <button
            onClick={onOpenAddTask}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#172554] hover:bg-[#1e3a8a] transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มงานใหม่เดี๋ยวนี้</span>
          </button>
        </div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">ชื่องาน & รายวิชา</th>
                  <th className="px-4 py-3.5">วันกำหนดส่ง</th>
                  <th className="px-4 py-3.5">ความสำคัญ</th>
                  <th className="px-4 py-3.5">สถานะ</th>
                  <th className="px-5 py-3.5 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => {
                  const urgency = getTaskUrgency(task.dueDate, task.status);
                  const isCompleted = task.status === 'Completed';

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectTask(task.id)}
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#1E293B] group-hover:text-[#2563EB] transition-colors text-sm">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {task.subject}
                          </span>
                          {task.submissionUrl && (
                            <span className="text-[10px] text-[#16A34A] flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> มีลิงก์ส่งงาน
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">
                          {formatThaiDate(task.dueDate)}
                        </div>
                        <div className="mt-1">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${urgency.badgeColor}`}
                          >
                            {urgency.badgeLabel}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            task.priority === 'High'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : task.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {task.priority === 'High'
                            ? 'สูงมาก / ด่วน'
                            : task.priority === 'Medium'
                            ? 'ปานกลาง'
                            : 'ต่ำ'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            isCompleted
                              ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                              : task.status === 'In Progress'
                              ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                          ) : (
                            <Clock className="w-3 h-3 text-slate-400" />
                          )}
                          <span>
                            {isCompleted
                              ? 'เสร็จสมบูรณ์'
                              : task.status === 'In Progress'
                              ? 'กำลังทำ'
                              : 'รอดำเนินการ'}
                          </span>
                        </span>
                      </td>
                      <td
                        className="px-5 py-4 text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectTask(task.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#172554] hover:bg-slate-100 transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                            title="แก้ไขงาน"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onNavigate('submit')}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#16A34A] hover:bg-emerald-50 transition-colors"
                            title="ส่งงาน"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setTaskToDelete(task)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="ลบงาน"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid / Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const urgency = getTaskUrgency(task.dueDate, task.status);
            const isCompleted = task.status === 'Completed';

            return (
              <div
                key={task.id}
                className="bg-white border border-slate-200/80 hover:border-[#2563EB]/40 hover:shadow-xs rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-[#2563EB] border border-blue-200/60">
                      {task.subject}
                    </span>
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

                  <h3
                    onClick={() => onSelectTask(task.id)}
                    className="text-base font-bold text-[#1E293B] group-hover:text-[#2563EB] transition-colors cursor-pointer line-clamp-1"
                  >
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 min-h-[32px]">
                    {task.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>กำหนดส่ง:</span>
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatThaiDate(task.dueDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${urgency.badgeColor}`}
                      >
                        {urgency.badgeLabel}
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {isCompleted
                          ? 'เสร็จแล้ว'
                          : task.status === 'In Progress'
                          ? 'กำลังทำ'
                          : 'รอดำเนินการ'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onSelectTask(task.id)}
                    className="text-xs text-[#2563EB] hover:text-[#172554] font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>รายละเอียด</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="แก้ไขงาน"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTaskToDelete(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="ลบงาน"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog before deletion */}
      <ConfirmModal
        isOpen={!!taskToDelete}
        title="ยืนยันการลบงาน?"
        message={`คุณแน่ใจหรือไม่ว่าต้องการลบงาน "${taskToDelete?.title}" ออกจากระบบ? การกระทำนี้ไม่สามารถย้อนกลับได้`}
        confirmText="ลบงานนี้"
        cancelText="ยกเลิก"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
