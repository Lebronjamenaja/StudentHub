export type UserRole = 'student' | 'admin';
export type AccountStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt?: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface Task {
  id: string;
  ownerUid: string;
  title: string;
  subject: string;
  description?: string;
  dueDate: string; // ISO date YYYY-MM-DD or YYYY-MM-DDTHH:mm
  priority: TaskPriority;
  status: TaskStatus;
  submissionUrl?: string;
  submissionNote?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type FeedbackCategory = 'bug' | 'feature' | 'ui' | 'security' | 'general';
export type FeedbackStatus = 'pending' | 'reviewed' | 'resolved';

export interface Feedback {
  id: string;
  userUid: string;
  userEmailMasked?: string;
  title: string;
  category: FeedbackCategory;
  details: string;
  status: FeedbackStatus;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export type NavigationPage =
  | 'dashboard'
  | 'tasks'
  | 'task-details'
  | 'submit'
  | 'feedback'
  | 'profile'
  | 'admin-dashboard'
  | 'admin-users'
  | 'login'
  | 'register'
  | '403'
  | '404';
