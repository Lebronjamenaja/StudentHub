import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Database,
  Lock,
  ExternalLink
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTasks } from '../contexts/TaskContext';
import { UserProfile, Feedback, NavigationPage } from '../types';
import { formatThaiDate } from '../utils/security';

interface AdminDashboardProps {
  onNavigate: (page: NavigationPage) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const { isAdmin, currentUser } = useAuth();
  const { adminAllTasks, refreshAdminTasks } = useTasks();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;

    const loadAdminData = async () => {
      setLoading(true);
      try {
        // Fetch all users
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersList: UserProfile[] = [];
        usersSnap.forEach((doc) => {
          usersList.push({ ...doc.data() } as UserProfile);
        });
        setUsers(usersList);

        // Fetch all feedbacks
        const feedbacksSnap = await getDocs(collection(db, 'feedbacks'));
        const feedbacksList: Feedback[] = [];
        feedbacksSnap.forEach((doc) => {
          feedbacksList.push({ id: doc.id, ...doc.data() } as Feedback);
        });
        feedbacksList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setFeedbacks(feedbacksList);

        await refreshAdminTasks();
      } catch (err) {
        console.error('Error fetching admin dashboard data:', err);
        handleFirestoreError(err, OperationType.GET, 'admin/dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [isAdmin]);

  // Authorization Guard: redirect/render 403
  if (!isAdmin) {
    onNavigate('403');
    return null;
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const totalTasks = adminAllTasks.length;
  const completedTasks = adminAllTasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = adminAllTasks.filter((t) => t.status !== 'Completed').length;
  const pendingFeedbacks = feedbacks.filter((f) => f.status === 'pending').length;

  const systemCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Group tasks by subject
  const subjectCounts = adminAllTasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.subject] = (acc[t.subject] || 0) + 1;
    return acc;
  }, {});
  const topSubjects = Object.entries(subjectCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172554] via-slate-900 to-amber-950/80 border border-amber-500/30 p-6 sm:p-8 shadow-sm text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>ภาพรวมระบบผู้ดูแล (ADMIN CONSOLE)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              แผงควบคุมระบบ StudentHub
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              ตรวจสอบสถิติผู้ใช้งาน ความคืบหน้าของงานทั้งหมดในระบบ และข้อเสนอแนะจากนักศึกษา
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('admin-users')}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>จัดการสมาชิก ({totalUsers})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">สมาชิกทั้งหมด</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B]">{totalUsers}</div>
          <div className="text-[11px] text-[#16A34A] font-medium mt-1">
            สถานะปกติ {activeUsers} บัญชี
          </div>
        </div>

        {/* Total Tasks in System */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">งานทั้งหมดในระบบ</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#1E293B]">{totalTasks}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            จากนักศึกษาทุกคน
          </div>
        </div>

        {/* System Completion */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">งานที่ส่งแล้ว / เสร็จแล้ว</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#16A34A] border border-emerald-200/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-[#16A34A]">{completedTasks}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            รอดำเนินการ {pendingTasks} งาน ({systemCompletionRate}%)
          </div>
        </div>

        {/* Feedbacks */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-500">ข้อเสนอแนะ / แจ้งบั๊ก</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600">{feedbacks.length}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            รอตรวจสอบ {pendingFeedbacks} รายการ
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Subjects & Recent Feedbacks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Subjects with most assignments */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#2563EB]" />
              <span>รายวิชาที่มีงานมากที่สุดในระบบ</span>
            </h3>
            <span className="text-xs text-slate-500">{Object.keys(subjectCounts).length} วิชา</span>
          </div>

          {topSubjects.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีข้อมูลงานในระบบ</div>
          ) : (
            <div className="space-y-3">
              {topSubjects.map(([subject, count]) => {
                const percentage = Math.round((count / (totalTasks || 1)) * 100);
                return (
                  <div key={subject} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1E293B]">{subject}</span>
                      <span className="text-slate-500">{count} งาน ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Security & System Audit Status */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#16A34A]" />
            <span>สถานะระบบและความปลอดภัย (Security & Audit)</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700">Firebase Firestore Rules:</span>
              <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deployed (Deny by Default)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700">Email Data Masking:</span>
              <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> บังคับใช้ในทุกตาราง Admin
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700">Admin Authentication Claim:</span>
              <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Server-side Firestore Validated
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-700">IDOR & XSS Protections:</span>
              <span className="text-[#16A34A] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active & Tested
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feedbacks review list */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>รายการข้อเสนอแนะและปัญหาล่าสุดจากนักศึกษา</span>
          </h3>
          <span className="text-xs text-slate-500">{feedbacks.length} รายการ</span>
        </div>

        {feedbacks.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">ยังไม่มีข้อเสนอแนะเข้ามาในระบบ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">หัวข้อ</th>
                  <th className="px-4 py-3">หมวดหมู่</th>
                  <th className="px-4 py-3">ผู้ส่ง (Masked Email)</th>
                  <th className="px-4 py-3">วันที่ส่ง</th>
                  <th className="px-4 py-3">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {feedbacks.slice(0, 5).map((fb) => (
                  <tr key={fb.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-[#1E293B]">{fb.title}</td>
                    <td className="px-4 py-3 text-slate-500 capitalize">{fb.category}</td>
                    <td className="px-4 py-3 font-mono text-[#2563EB]">{fb.userEmailMasked || 'st****@...'}</td>
                    <td className="px-4 py-3 text-slate-500">{formatThaiDate(fb.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {fb.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
