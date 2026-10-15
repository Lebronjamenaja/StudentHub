import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle } from 'lucide-react';
import { Task } from '../../types';
import { formatThaiDate } from '../../utils/security';

interface CalendarViewProps {
  tasks: Task[];
  onSelectTask: (taskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onSelectTask }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const daysOfWeek = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

  // Map tasks by date YYYY-MM-DD
  const tasksByDate = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    const dateKey = task.dueDate.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(task);
    return acc;
  }, {});

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              ปฏิทินกำหนดส่งงาน — {monthNames[month]} พ.ศ. {year + 543}
            </h3>
            <p className="text-xs text-slate-400">ตรวจสอบกำหนดการและจัดการเวลาส่งงาน</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="เดือนก่อนหน้า"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1.5 rounded-xl border border-slate-800 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            เดือนนี้
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="เดือนถัดไป"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysOfWeek.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs font-semibold py-2 text-slate-400 uppercase tracking-wider"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="min-h-[100px] bg-slate-950/30 rounded-xl border border-slate-800/40 p-2 opacity-30"
              />
            );
          }

          const currentDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTasks = tasksByDate[currentDayStr] || [];
          const isToday = currentDayStr === todayStr;

          return (
            <div
              key={`day-${day}`}
              className={`min-h-[105px] rounded-xl border p-2 flex flex-col transition-all ${
                isToday
                  ? 'bg-purple-950/20 border-purple-500/50 shadow-sm shadow-purple-950'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-purple-600 text-white' : 'text-slate-400'
                  }`}
                >
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {dayTasks.length} งาน
                  </span>
                )}
              </div>

              <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5">
                {dayTasks.map((task) => {
                  const isCompleted = task.status === 'Completed';
                  return (
                    <button
                      key={task.id}
                      onClick={() => onSelectTask(task.id)}
                      className={`w-full text-left p-1.5 rounded-lg text-xs truncate border transition-all block ${
                        isCompleted
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                          : task.priority === 'High'
                          ? 'bg-rose-950/40 border-rose-500/30 text-rose-200 hover:bg-rose-900/40'
                          : 'bg-indigo-950/40 border-indigo-500/30 text-indigo-200 hover:bg-indigo-900/40'
                      }`}
                      title={`${task.subject}: ${task.title}`}
                    >
                      <div className="flex items-center gap-1">
                        {isCompleted ? (
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate font-medium">{task.title}</span>
                      </div>
                      <div className="text-[10px] opacity-75 truncate">{task.subject}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
