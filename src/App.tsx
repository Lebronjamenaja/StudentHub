/**
 * StudentHub — Student Assignment and Task Management System
 * Built with React, TypeScript, Tailwind CSS, Firebase Authentication, and Cloud Firestore
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { TaskProvider, useTasks } from './contexts/TaskContext';
import { NavigationPage, Task } from './types';
import { testConnection } from './lib/firebase';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { TaskModal } from './components/tasks/TaskModal';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MyTasks } from './pages/MyTasks';
import { TaskDetails } from './pages/TaskDetails';
import { SubmissionPage } from './pages/SubmissionPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserManagement } from './pages/UserManagement';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const { currentUser, loading: authLoading, isAdmin } = useAuth();
  const { addTask, updateTask } = useTasks();

  // Navigation State with hash routing fallback for Vercel/Cloud Run
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Boot connection check as mandated by Firebase Skill
  useEffect(() => {
    testConnection();
  }, []);

  // Parse initial route from URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (!hash) {
        setCurrentPage(currentUser ? 'dashboard' : 'login');
        return;
      }

      if (hash.startsWith('tasks/')) {
        const id = hash.split('/')[1];
        if (id) {
          setSelectedTaskId(id);
          setCurrentPage('task-details');
          return;
        }
      }

      const validPages: NavigationPage[] = [
        'dashboard',
        'tasks',
        'task-details',
        'submit',
        'feedback',
        'profile',
        'admin-dashboard',
        'admin-users',
        'login',
        'register',
        '403',
        '404',
      ];

      if (validPages.includes(hash as NavigationPage)) {
        setCurrentPage(hash as NavigationPage);
      } else {
        setCurrentPage('404');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const navigateTo = (page: NavigationPage, taskId?: string) => {
    if (taskId) {
      setSelectedTaskId(taskId);
      window.location.hash = `#/tasks/${taskId}`;
    } else {
      window.location.hash = `#/${page}`;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Auth gate check
  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      if (currentPage !== 'login' && currentPage !== 'register' && currentPage !== '404') {
        navigateTo('login');
      }
    } else {
      if (currentPage === 'login' || currentPage === 'register') {
        navigateTo('dashboard');
      } else if ((currentPage === 'admin-dashboard' || currentPage === 'admin-users') && !isAdmin) {
        navigateTo('403');
      }
    }
  }, [currentUser, authLoading, currentPage, isAdmin]);

  const handleOpenAddTask = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (data: {
    title: string;
    subject: string;
    description: string;
    dueDate: string;
    priority: Task['priority'];
    status: Task['status'];
  }) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await addTask(data);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        <div className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          กำลังเตรียมระบบ StudentHub...
        </div>
      </div>
    );
  }

  const isAuthPage = currentPage === 'login' || currentPage === 'register';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenAddTask={handleOpenAddTask}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex">
        {/* Sidebar (Rendered when authenticated and not on login/register) */}
        {!isAuthPage && currentUser && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={navigateTo}
            isMobileOpen={isMobileMenuOpen}
            onCloseMobile={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full transition-all ${
            !isAuthPage && currentUser ? 'lg:pl-72' : ''
          }`}
        >
          {currentPage === 'login' && <Login onNavigate={navigateTo} />}
          {currentPage === 'register' && <Register onNavigate={navigateTo} />}
          {currentPage === 'dashboard' && (
            <Dashboard
              onNavigate={navigateTo}
              onSelectTask={(id) => navigateTo('task-details', id)}
              onOpenAddTask={handleOpenAddTask}
            />
          )}
          {currentPage === 'tasks' && (
            <MyTasks
              onSelectTask={(id) => navigateTo('task-details', id)}
              onEditTask={handleOpenEditTask}
              onOpenAddTask={handleOpenAddTask}
              onNavigate={navigateTo}
            />
          )}
          {currentPage === 'task-details' && (
            <TaskDetails
              taskId={selectedTaskId}
              onNavigate={navigateTo}
              onEditTask={handleOpenEditTask}
            />
          )}
          {currentPage === 'submit' && (
            <SubmissionPage
              onNavigate={navigateTo}
              onSelectTask={(id) => navigateTo('task-details', id)}
              preselectedTaskId={selectedTaskId}
            />
          )}
          {currentPage === 'feedback' && <FeedbackPage />}
          {currentPage === 'profile' && <ProfilePage />}
          {currentPage === 'admin-dashboard' && <AdminDashboard onNavigate={navigateTo} />}
          {currentPage === 'admin-users' && <UserManagement onNavigate={navigateTo} />}
          {currentPage === '403' && <ForbiddenPage onNavigate={navigateTo} />}
          {currentPage === '404' && <NotFoundPage onNavigate={navigateTo} />}
        </main>
      </div>

      {/* Task Modal (Form 1) */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <TaskProvider>
          <AppContent />
        </TaskProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
