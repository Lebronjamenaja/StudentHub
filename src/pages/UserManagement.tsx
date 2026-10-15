import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Lock,
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Eye,
  AlertCircle
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { UserProfile, NavigationPage } from '../types';
import { maskEmail, formatThaiDate } from '../utils/security';
import { ConfirmModal } from '../components/common/ConfirmModal';

interface UserManagementProps {
  onNavigate: (page: NavigationPage) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ onNavigate }) => {
  const { isAdmin, currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Selected user for status change
  const [statusTargetUser, setStatusTargetUser] = useState<UserProfile | null>(null);
  const [viewingUser, setViewingUser] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push({ ...d.data() } as UserProfile);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setUsers(list);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    onNavigate('403');
    return null;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.uid.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleToggleStatus = async () => {
    if (!statusTargetUser) return;

    // Prevent suspending own admin account
    if (statusTargetUser.uid === currentUser?.uid) {
      showToast('ไม่สามารถระงับบัญชีของตัวเองได้', 'error');
      setStatusTargetUser(null);
      return;
    }

    const newStatus = statusTargetUser.status === 'active' ? 'suspended' : 'active';

    try {
      await updateDoc(doc(db, 'users', statusTargetUser.uid), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.uid === statusTargetUser.uid ? { ...u, status: newStatus } : u
        )
      );

      showToast(
        `เปลี่ยนสถานะบัญชี ${statusTargetUser.displayName} เป็น ${newStatus === 'active' ? 'ใช้งานปกติ' : 'ระงับการใช้งาน'} แล้ว`,
        'success'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${statusTargetUser.uid}`);
    } finally {
      setStatusTargetUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-amber-400" />
            <span>จัดการสมาชิก & ผู้ใช้งาน (User Management)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ตรวจสอบรายชื่อนักศึกษาและผู้ดูแล พร้อมมาตรการปกปิดอีเมล (Data Masking) ตามมาตรฐานความปลอดภัย
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">Data Masking: เปิดใช้งาน</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาตามชื่อ, อีเมล หรือ UID..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 transition-colors"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <option value="ALL">บทบาททั้งหมด (Role)</option>
              <option value="student">นักศึกษา (Student)</option>
              <option value="admin">ผู้ดูแลระบบ (Admin)</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <option value="ALL">สถานะทั้งหมด (Status)</option>
              <option value="active">ใช้งานปกติ (Active)</option>
              <option value="suspended">ระงับชั่วคราว (Suspended)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
          <span>พบ {filteredUsers.length} จากทั้งหมด {users.length} สมาชิก</span>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">สมาชิก (Display Name)</th>
                <th className="px-4 py-3.5">อีเมลปกปิด (Masked Email)</th>
                <th className="px-4 py-3.5">บทบาท (Role)</th>
                <th className="px-4 py-3.5">สถานะบัญชี</th>
                <th className="px-4 py-3.5">วันที่ลงทะเบียน</th>
                <th className="px-5 py-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    กำลังโหลดรายชื่อสมาชิก...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    ไม่พบสมาชิกที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrent = user.uid === currentUser?.uid;
                  const masked = maskEmail(user.email);
                  const isActive = user.status === 'active';

                  return (
                    <tr key={user.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span>{user.displayName}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                              คุณ
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                          {user.uid}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="font-mono text-purple-300 font-medium">
                          {masked}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            user.role === 'admin'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          }`}
                        >
                          {user.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'นักศึกษา (Student)'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                          }`}
                        >
                          {isActive ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                          )}
                          <span>{isActive ? 'ใช้งานปกติ' : 'ระงับชั่วคราว'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-400">
                        {formatThaiDate(user.createdAt)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isCurrent && (
                            <button
                              onClick={() => setStatusTargetUser(user)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                                isActive
                                  ? 'border-rose-500/30 text-rose-300 hover:bg-rose-500/10'
                                  : 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10'
                              }`}
                              title={isActive ? 'ระงับบัญชี' : 'เปิดใช้งานบัญชี'}
                            >
                              {isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                              <span>{isActive ? 'ระงับ' : 'เปิดใช้'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">รายละเอียดสมาชิก</h3>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  viewingUser.role === 'admin'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                }`}
              >
                {viewingUser.role.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="text-slate-400">ชื่อ-นามสกุล:</div>
                <div className="text-slate-100 font-bold text-sm">{viewingUser.displayName}</div>

                <div className="text-slate-400 pt-2">อีเมล (Masked for Security):</div>
                <div className="font-mono text-purple-300">{maskEmail(viewingUser.email)}</div>

                <div className="text-slate-400 pt-2">UID:</div>
                <div className="font-mono text-slate-300 text-[11px] break-all">{viewingUser.uid}</div>

                <div className="text-slate-400 pt-2">วันที่สร้างบัญชี:</div>
                <div className="text-slate-200">{formatThaiDate(viewingUser.createdAt, true)}</div>
              </div>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for status change */}
      <ConfirmModal
        isOpen={!!statusTargetUser}
        title={
          statusTargetUser?.status === 'active'
            ? 'ยืนยันการระงับบัญชีผู้ใช้?'
            : 'ยืนยันการเปิดใช้งานบัญชี?'
        }
        message={
          statusTargetUser?.status === 'active'
            ? `คุณต้องการระงับการใช้งานบัญชี "${statusTargetUser?.displayName}" (${maskEmail(statusTargetUser?.email)}) หรือไม่? ผู้ใช้จะไม่สามารถเข้าสู่ระบบเพื่อแก้ไขงานได้`
            : `คุณต้องการเปิดใช้งานบัญชี "${statusTargetUser?.displayName}" (${maskEmail(statusTargetUser?.email)}) อีกครั้งหรือไม่?`
        }
        confirmText={statusTargetUser?.status === 'active' ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
        cancelText="ยกเลิก"
        isDestructive={statusTargetUser?.status === 'active'}
        onConfirm={handleToggleStatus}
        onCancel={() => setStatusTargetUser(null)}
      />
    </div>
  );
};
