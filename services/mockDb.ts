import { Course, Enrollment, User, UserRole } from '../types';

// Initial Mock Data
const MOCK_TEACHER: User = {
  id: 'teacher-1',
  email: 'teacher@lumina.com',
  name: 'Prof. Albus',
  role: 'TEACHER',
  streak: 0,
  lastActivityDate: null,
};

const MOCK_STUDENT: User = {
  id: 'student-1',
  email: 'student@lumina.com',
  name: 'Harry P.',
  role: 'STUDENT',
  streak: 5,
  lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
};

const INITIAL_COURSES: Course[] = [
  {
    id: 'c-1',
    teacherId: 'teacher-1',
    title: 'Introduction to Astrophysics',
    description: 'Learn the basics of stars, galaxies, and the universe.',
    difficulty: 'Beginner',
    targetAudience: 'High School Students',
    estimatedDuration: '4 Weeks',
    enrolledCount: 12,
    tags: ['Science', 'Space'],
    createdAt: new Date().toISOString(),
    modules: [
      {
        id: 'm-1',
        title: 'The Solar System',
        description: 'Our immediate neighborhood.',
        lessons: [
          {
            id: 'l-1',
            title: 'The Sun',
            content: 'The sun is a star at the center of the Solar System...',
            durationMinutes: 10,
            quiz: [
              {
                id: 'q-1',
                question: 'What is the Sun?',
                options: ['Planet', 'Star', 'Moon', 'Comet'],
                correctAnswerIndex: 1
              }
            ]
          }
        ]
      }
    ]
  }
];

// Helper to simulate DB delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class MockDB {
  private get<T>(key: string, defaultVal: T): T {
    const stored = localStorage.getItem(`lumina_${key}`);
    return stored ? JSON.parse(stored) : defaultVal;
  }

  private set(key: string, value: any) {
    localStorage.setItem(`lumina_${key}`, JSON.stringify(value));
  }

  // --- Auth ---
  async login(role: UserRole): Promise<User> {
    await delay(500);
    const user = role === 'TEACHER' ? MOCK_TEACHER : MOCK_STUDENT;
    // Update streak logic on login for students
    if (role === 'STUDENT') {
      const today = new Date().toISOString().split('T')[0];
      const last = user.lastActivityDate ? user.lastActivityDate.split('T')[0] : null;
      
      if (last !== today) {
        // Simple streak logic: if last activity was yesterday, increment. If older, reset.
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (last === yesterday) {
          user.streak += 1;
        } else if (last !== today) {
           // If it wasn't today and wasn't yesterday, reset (unless it's first login)
           if (last) user.streak = 1;
        }
        user.lastActivityDate = new Date().toISOString();
      }
    }
    return user;
  }

  // --- Courses ---
  async getCourses(): Promise<Course[]> {
    await delay(600);
    return this.get<Course[]>('courses', INITIAL_COURSES);
  }

  async createCourse(course: Course): Promise<void> {
    await delay(800);
    const courses = this.get<Course[]>('courses', INITIAL_COURSES);
    this.set('courses', [course, ...courses]);
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    await delay(300);
    const courses = this.get<Course[]>('courses', INITIAL_COURSES);
    return courses.find(c => c.id === id);
  }
  
  async deleteCourse(id: string): Promise<void> {
    await delay(400);
    const courses = this.get<Course[]>('courses', INITIAL_COURSES);
    this.set('courses', courses.filter(c => c.id !== id));
  }

  // --- Enrollments & Progress ---
  async getEnrollments(studentId: string): Promise<Enrollment[]> {
    await delay(400);
    return this.get<Enrollment[]>(`enrollments_${studentId}`, []);
  }

  async enroll(studentId: string, courseId: string): Promise<void> {
    await delay(500);
    const enrollments = this.get<Enrollment[]>(`enrollments_${studentId}`, []);
    if (!enrollments.find(e => e.courseId === courseId)) {
      const newEnrollment: Enrollment = {
        courseId,
        studentId,
        progress: 0,
        completedLessonIds: [],
        enrolledAt: new Date().toISOString()
      };
      this.set(`enrollments_${studentId}`, [...enrollments, newEnrollment]);
    }
  }

  async completeLesson(studentId: string, courseId: string, lessonId: string): Promise<void> {
    await delay(300);
    const enrollments = this.get<Enrollment[]>(`enrollments_${studentId}`, []);
    const enrollment = enrollments.find(e => e.courseId === courseId);
    
    if (enrollment && !enrollment.completedLessonIds.includes(lessonId)) {
      enrollment.completedLessonIds.push(lessonId);
      // Calculate basic progress (simplified)
      const courses = this.get<Course[]>('courses', INITIAL_COURSES);
      const course = courses.find(c => c.id === courseId);
      if (course) {
        const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
        enrollment.progress = Math.round((enrollment.completedLessonIds.length / totalLessons) * 100);
      }
      this.set(`enrollments_${studentId}`, enrollments);
      
      // Update streak activity
      const user = MOCK_STUDENT; // In real app, fetch user from DB
      user.lastActivityDate = new Date().toISOString();
    }
  }
}

export const db = new MockDB();