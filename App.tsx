import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { CourseGenerator } from './components/CourseGenerator';
import { CoursePlayer } from './components/CoursePlayer';
import { CourseEditor } from './components/CourseEditor';
import { User, UserRole } from './types';
import { db, authService } from './services/mockDb';
import { ThemeProvider } from './ThemeContext';
import { supabase } from './services/supabase';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'create-course' | 'play-course' | 'edit-course'>('dashboard');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
            const profile = await db.getUserProfile(session.user.id);
            if (profile) setUser(profile);
        }
        setLoading(false);
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
             const profile = await db.getUserProfile(session.user.id);
             if (profile) setUser(profile);
        } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setView('dashboard');
        }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (role: UserRole) => {
    // Role handling is now implicit via the profile fetched from Supabase
    // This callback helps trigger UI updates if needed, but the useEffect handles state
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setView('dashboard');
  };

  if (loading) return <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex items-center justify-center text-stone-400">Loading Lumina...</div>;

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  let content;
  let title = "Dashboard";

  if (view === 'create-course' && user.role === 'TEACHER') {
    content = (
      <CourseGenerator 
        teacherId={user.id} 
        onSuccess={() => setView('dashboard')}
        onCancel={() => setView('dashboard')} 
      />
    );
    title = "Create New Course";
  } else if (view === 'edit-course' && user.role === 'TEACHER' && activeCourseId) {
    content = (
      <CourseEditor 
        courseId={activeCourseId} 
        onClose={() => { setView('dashboard'); setActiveCourseId(null); }} 
      />
    );
    title = ""; // Editor has its own header
  } else if (view === 'play-course' && user.role === 'STUDENT' && activeCourseId) {
    content = (
      <CoursePlayer 
        courseId={activeCourseId} 
        studentId={user.id} 
        onExit={() => { setView('dashboard'); setActiveCourseId(null); }}
      />
    );
    title = ""; // Player has its own header
  } else {
    if (user.role === 'TEACHER') {
      content = (
        <TeacherDashboard 
          user={user} 
          onCreateClick={() => setView('create-course')}
          onEditClick={(id) => { setActiveCourseId(id); setView('edit-course'); }}
        />
      );
      title = "Teacher Dashboard";
    } else {
      content = <StudentDashboard user={user} onPlayCourse={(id) => { setActiveCourseId(id); setView('play-course'); }} />;
      title = `Welcome back, ${user.name ? user.name.split(' ')[0] : 'Student'}!`;
    }
  }

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      title={title}
      onDashboard={() => setView('dashboard')}
    >
      {content}
    </Layout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}