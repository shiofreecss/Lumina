import { Course, Enrollment, User, UserRole } from '../types';
import { supabase, isSupabaseConfigured } from './supabase';

// --- MOCK DATA FALLBACK ---
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
  lastActivityDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
};

const MOCK_COURSES: Course[] = [
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
            resources: [
               { id: 'r-1', title: 'Solar System Slides', type: 'slide', url: '#' }
            ],
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
  },
  {
    id: 'c-frontend',
    teacherId: 'teacher-1',
    title: 'Modern Frontend Development',
    description: 'Master React, TypeScript, and Tailwind CSS.',
    difficulty: 'Intermediate',
    targetAudience: 'Web Developers',
    estimatedDuration: '6 Weeks',
    enrolledCount: 45,
    tags: ['React', 'Frontend'],
    createdAt: new Date().toISOString(),
    modules: [
      {
        id: 'm-fe-1',
        title: 'React Essentials',
        description: 'Components, State, and Props.',
        lessons: [
          {
            id: 'l-fe-1',
            title: 'Components & JSX',
            content: 'React components are the building blocks of your application.',
            durationMinutes: 15,
            quiz: [{ id: 'q-fe-1', question: 'What is JSX?', options: ['JavaScript XML', 'Java Syntax', 'JSON X', 'Java Source'], correctAnswerIndex: 0 }]
          }
        ]
      }
    ]
  }
];

class DatabaseService {
  
  // --- Auth ---
  
  async getUserProfile(userId: string): Promise<User | null> {
    if (!isSupabaseConfigured) {
      if (userId === 'teacher-1') return MOCK_TEACHER;
      if (userId === 'student-1') return MOCK_STUDENT;
      // Default fallback for new mock users
      return {
          id: userId,
          email: 'mock@user.com',
          name: 'Mock User',
          role: 'STUDENT',
          streak: 1,
          lastActivityDate: new Date().toISOString()
      };
    }

    // 1. Try to get from Profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data) {
        // Map snake_case DB fields to camelCase TS interface
        return {
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role as UserRole,
            streak: data.streak || 0,
            lastActivityDate: data.last_activity_date
        };
    }

    // 2. Self-Healing: If profile missing (e.g. RLS blocked insert during signup), 
    // try to recover from Auth Metadata
    if (error || !data) {
        console.warn("Profile missing in table, attempting recovery from Auth Metadata...");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.id === userId) {
             const meta = user.user_metadata;
             // Only proceed if we have valid metadata
             if (meta && meta.name) {
                 const newProfile = {
                     id: user.id,
                     email: user.email || '',
                     name: meta.name,
                     role: (meta.role as UserRole) || 'STUDENT',
                     streak: 0,
                     last_activity_date: new Date().toISOString()
                 };
                 
                 // Attempt to Sync to DB (Upsert)
                 await supabase.from('profiles').upsert(newProfile);
                 
                 return {
                     id: newProfile.id,
                     email: newProfile.email,
                     name: newProfile.name,
                     role: newProfile.role,
                     streak: newProfile.streak,
                     lastActivityDate: newProfile.last_activity_date
                 };
             }
        }
    }

    console.error("Critical: Could not fetch or recover user profile.");
    return null;
  }

  // --- Courses ---
  async getCourses(): Promise<Course[]> {
    if (!isSupabaseConfigured) return MOCK_COURSES;

    const { data, error } = await supabase
      .from('courses')
      .select('*');
      
    if (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
    
    return data.map((row: any) => ({
      ...row,
      teacherId: row.teacher_id,
      enrolledCount: row.enrolled_count,
      estimatedDuration: row.estimated_duration,
      targetAudience: row.target_audience,
      createdAt: row.created_at
    })) as Course[];
  }

  async createCourse(course: Course): Promise<void> {
    if (!isSupabaseConfigured) {
        MOCK_COURSES.unshift(course);
        return;
    }

    const { error } = await supabase
      .from('courses')
      .insert({
        id: course.id,
        teacher_id: course.teacherId,
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        target_audience: course.targetAudience,
        estimated_duration: course.estimatedDuration,
        enrolled_count: course.enrolledCount,
        tags: course.tags,
        created_at: course.createdAt,
        modules: course.modules
      });

    if (error) console.error("Error creating course:", error);
  }

  async updateCourse(course: Course): Promise<void> {
    if (!isSupabaseConfigured) {
        const idx = MOCK_COURSES.findIndex(c => c.id === course.id);
        if (idx !== -1) MOCK_COURSES[idx] = course;
        return;
    }

    const { error } = await supabase
      .from('courses')
      .update({
        title: course.title,
        description: course.description,
        difficulty: course.difficulty,
        target_audience: course.targetAudience,
        estimated_duration: course.estimatedDuration,
        tags: course.tags,
        modules: course.modules
      })
      .eq('id', course.id);

    if (error) console.error("Error updating course:", error);
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    if (!isSupabaseConfigured) {
        return MOCK_COURSES.find(c => c.id === id);
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    return {
      ...data,
      teacherId: data.teacher_id,
      enrolledCount: data.enrolled_count,
      estimatedDuration: data.estimated_duration,
      targetAudience: data.target_audience,
      createdAt: data.created_at
    } as Course;
  }
  
  async deleteCourse(id: string): Promise<void> {
    if (!isSupabaseConfigured) {
        const idx = MOCK_COURSES.findIndex(c => c.id === id);
        if (idx !== -1) MOCK_COURSES.splice(idx, 1);
        return;
    }

    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) console.error("Error deleting course:", error);
  }

  // --- Enrollments & Progress ---
  async getEnrollments(studentId: string): Promise<Enrollment[]> {
    if (!isSupabaseConfigured) return []; 

    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId);

    if (error) return [];

    return data.map((row: any) => ({
      courseId: row.course_id,
      studentId: row.student_id,
      progress: row.progress,
      completedLessonIds: row.completed_lesson_ids || [],
      enrolledAt: row.enrolled_at
    }));
  }

  async enroll(studentId: string, courseId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase
      .from('enrollments')
      .insert({
        student_id: studentId,
        course_id: courseId,
        progress: 0,
        completed_lesson_ids: [],
        enrolled_at: new Date().toISOString()
      });

    if (error) {
       console.error("Enrollment error:", error);
       return;
    }
    
    const { data } = await supabase.from('courses').select('enrolled_count').eq('id', courseId).single();
    if (data) {
       await supabase.from('courses').update({ enrolled_count: (data.enrolled_count || 0) + 1 }).eq('id', courseId);
    }
  }

  async completeLesson(studentId: string, courseId: string, lessonId: string): Promise<void> {
    if (!isSupabaseConfigured) return;

    // 1. Get current enrollment
    const { data: enrollment, error } = await supabase
      .from('enrollments')
      .select('*')
      .match({ student_id: studentId, course_id: courseId })
      .single();

    if (error || !enrollment) return;

    const completedIds = enrollment.completed_lesson_ids || [];
    if (completedIds.includes(lessonId)) return;

    const newCompletedIds = [...completedIds, lessonId];

    // 2. Calculate progress
    const course = await this.getCourseById(courseId);
    let newProgress = enrollment.progress;
    
    if (course) {
        const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
        newProgress = totalLessons > 0 ? Math.round((newCompletedIds.length / totalLessons) * 100) : 0;
    }

    // 3. Update enrollment
    await supabase
      .from('enrollments')
      .update({
        completed_lesson_ids: newCompletedIds,
        progress: newProgress
      })
      .match({ student_id: studentId, course_id: courseId });

    // 4. Update Streak (Profile)
    const today = new Date().toISOString().split('T')[0];
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', studentId).single();
    
    if (profile) {
       const last = profile.last_activity_date ? profile.last_activity_date.split('T')[0] : null;
       let newStreak = profile.streak;
       
       const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
       
       if (last !== today) {
           if (last === yesterday) {
               newStreak += 1;
           } else {
               newStreak = 1; 
           }
           await supabase.from('profiles').update({ 
               streak: newStreak, 
               last_activity_date: new Date().toISOString() 
           }).eq('id', studentId);
       }
    }
  }
}

// Keep the singleton export 'db' to maintain compatibility with existing code
export const db = new DatabaseService();

// Also export a helper for Auth component
export const authService = {
    async login(email: string, password: string) {
        if (!isSupabaseConfigured) {
            // Mock Login
            if (email.includes('teacher')) {
                return { data: { user: { id: 'teacher-1', email } }, error: null };
            }
            return { data: { user: { id: 'student-1', email } }, error: null };
        }
        return supabase.auth.signInWithPassword({ email, password });
    },
    
    async signUp(email: string, password: string, name: string, role: UserRole) {
        if (!isSupabaseConfigured) {
             // Mock Signup
             const newId = `user-${Date.now()}`;
             return { data: { user: { id: newId, email } }, error: null };
        }

        // 1. Sign Up with Metadata (Critical for RLS/Recovery)
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                    streak: 0,
                    last_activity_date: new Date().toISOString()
                }
            }
        });
        
        // 2. Attempt to create profile row immediately
        if (!error && data.user) {
            // If email confirmation is ON, data.user exists but session is null.
            // RLS policies using auth.uid() might block this insert if no session.
            // However, we rely on getUserProfile's self-healing if this fails.
            
            const { error: profileError } = await supabase.from('profiles').insert({
                id: data.user.id,
                email: email,
                name: name,
                role: role,
                streak: 0,
                last_activity_date: new Date().toISOString()
            });
            
            if (profileError) {
                console.log("Profile insert skipped (likely waiting for email confirm). Metadata saved.", profileError.message);
            }
        }
        return { data, error };
    },
    
    async logout() {
        if (!isSupabaseConfigured) return;
        return supabase.auth.signOut();
    }
};