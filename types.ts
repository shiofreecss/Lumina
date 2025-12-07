export type UserRole = 'TEACHER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  streak: number;
  lastActivityDate: string | null; // ISO Date string
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string; // Markdown or text
  durationMinutes: number;
  isCompleted?: boolean; // For student tracking
  quiz?: QuizQuestion[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  targetAudience: string;
  estimatedDuration: string;
  modules: Module[];
  enrolledCount: number;
  tags: string[];
  createdAt: string;
}

export interface Enrollment {
  courseId: string;
  studentId: string;
  progress: number; // 0-100
  completedLessonIds: string[];
  enrolledAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}