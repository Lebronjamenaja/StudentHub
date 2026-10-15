import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  deleteDoc,
  updateDoc,
  getDocs
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { sanitizeText, isValidHttpUrl } from '../utils/security';

interface TaskInput {
  title: string;
  subject: string;
  description?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

interface TaskContextType {
  tasks: Task[];
  adminAllTasks: Task[];
  loading: boolean;
  addTask: (data: TaskInput) => Promise<string>;
  updateTask: (taskId: string, data: Partial<TaskInput>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  submitAssignment: (taskId: string, submissionUrl: string, note: string) => Promise<void>;
  getTask: (taskId: string) => Task | undefined;
  refreshAdminTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [adminAllTasks, setAdminAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Subscribe to current user's tasks
  useEffect(() => {
    if (!currentUser) {
      setTasks([]);
      setAdminAllTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('ownerUid', '==', currentUser.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedTasks: Task[] = [];
        snapshot.forEach((docSnap) => {
          loadedTasks.push({ id: docSnap.id, ...docSnap.data() } as Task);
        });
        // Sort by dueDate ascending
        loadedTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setTasks(loadedTasks);
        setLoading(false);
      },
      (error) => {
        console.error('Task snapshot listener error:', error);
        handleFirestoreError(error, OperationType.LIST, 'tasks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Load all tasks if admin
  const refreshAdminTasks = async () => {
    if (!isAdmin || !currentUser) return;
    try {
      const snap = await getDocs(collection(db, 'tasks'));
      const all: Task[] = [];
      snap.forEach((docSnap) => {
        all.push({ id: docSnap.id, ...docSnap.data() } as Task);
      });
      setAdminAllTasks(all);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'tasks');
    }
  };

  useEffect(() => {
    if (isAdmin && currentUser) {
      refreshAdminTasks();
    }
  }, [isAdmin, currentUser]);

  const addTask = async (input: TaskInput): Promise<string> => {
    if (!currentUser) throw new Error('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ');

    // Validation
    const cleanTitle = sanitizeText(input.title);
    const cleanSubject = sanitizeText(input.subject);
    const cleanDescription = sanitizeText(input.description || '');

    if (!cleanTitle || cleanTitle.length < 2) {
      throw new Error('กรุณาระบุชื่องานอย่างน้อย 2 ตัวอักษร');
    }
    if (!cleanSubject) {
      throw new Error('กรุณาระบุรายวิชา');
    }
    if (!input.dueDate) {
      throw new Error('กรุณาระบุวันกำหนดส่ง');
    }

    // ID must match ^[a-zA-Z0-9_-]+$ as defined in security rules
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();

    const newTask: Task = {
      id: taskId,
      ownerUid: currentUser.uid,
      title: cleanTitle,
      subject: cleanSubject,
      description: cleanDescription,
      dueDate: input.dueDate,
      priority: input.priority || 'Medium',
      status: input.status || 'Pending',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      await setDoc(doc(db, 'tasks', taskId), newTask);
      showToast('เพิ่มงานใหม่สำเร็จแล้ว', 'success');
      return taskId;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tasks/${taskId}`);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<TaskInput>): Promise<void> => {
    if (!currentUser) throw new Error('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ');

    const cleanUpdates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (updates.title !== undefined) {
      const clean = sanitizeText(updates.title);
      if (clean.length < 2) throw new Error('ชื่องานต้องมีอย่างน้อย 2 ตัวอักษร');
      cleanUpdates.title = clean;
    }
    if (updates.subject !== undefined) {
      cleanUpdates.subject = sanitizeText(updates.subject);
    }
    if (updates.description !== undefined) {
      cleanUpdates.description = sanitizeText(updates.description);
    }
    if (updates.dueDate !== undefined) {
      cleanUpdates.dueDate = updates.dueDate;
    }
    if (updates.priority !== undefined) {
      cleanUpdates.priority = updates.priority;
    }
    if (updates.status !== undefined) {
      cleanUpdates.status = updates.status;
    }

    try {
      await updateDoc(doc(db, 'tasks', taskId), cleanUpdates);
      showToast('อัปเดตข้อมูลงานเรียบร้อยแล้ว', 'success');
      if (isAdmin) {
        await refreshAdminTasks();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    if (!currentUser) throw new Error('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ');

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      showToast('ลบงานเรียบร้อยแล้ว', 'info');
      if (isAdmin) {
        await refreshAdminTasks();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  const submitAssignment = async (taskId: string, submissionUrl: string, note: string): Promise<void> => {
    if (!currentUser) throw new Error('ผู้ใช้ยังไม่ได้เข้าสู่ระบบ');

    const trimmedUrl = submissionUrl.trim();
    if (!trimmedUrl || !isValidHttpUrl(trimmedUrl)) {
      throw new Error('กรุณาระบุ URL ของไฟล์หรือแหล่งเก็บงานที่ถูกต้อง (ขึ้นต้นด้วย http:// หรือ https://)');
    }

    const cleanNote = sanitizeText(note);
    const nowIso = new Date().toISOString();

    try {
      await updateDoc(doc(db, 'tasks', taskId), {
        submissionUrl: trimmedUrl,
        submissionNote: cleanNote,
        submittedAt: nowIso,
        status: 'Completed',
        updatedAt: nowIso,
      });
      showToast('ส่งงานสำเร็จเรียบร้อยแล้ว! สถานะเปลี่ยนเป็นเสร็จสมบูรณ์', 'success');
      if (isAdmin) {
        await refreshAdminTasks();
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const getTask = (taskId: string): Task | undefined => {
    return tasks.find((t) => t.id === taskId) || adminAllTasks.find((t) => t.id === taskId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        adminAllTasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        submitAssignment,
        getTask,
        refreshAdminTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
