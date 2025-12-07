import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Layout } from './components/Layout';
import { TeacherDashboard } from './components/TeacherDashboard';
import { StudentDashboard } from './components/StudentDashboard';
import { CourseGenerator } from './components/CourseGenerator';
import { CoursePlayer } from './components/CoursePlayer';
import { User, UserRole } from './types';
import { db } from './services/mockDb';
import { ThemeProvider } from './ThemeContext';

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'dashboard' | 'create-course' | 'play-course'>('dashboard');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lumina_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const handleLogin = async (role: UserRole) => {
    const loggedInUser = await db.login(role);
    setUser(loggedInUser);
    localStorage.setItem('lumina_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('lumina_user');
    setView('dashboard');
  };

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
  } else if (view === 'play-course' && user.role === 'STUDENT' && activeCourseId) {
    content = (
      <CoursePlayer 
        courseId={activeCourseId} 
        studentId={user.id} 
        onExit={() => { setView('dashboard'); setActiveCourseId(null); }}
      />
    );
    title = "";
  } else {
    if (user.role === 'TEACHER') {
      content = <TeacherDashboard user={user} onCreateClick={() => setView('create-course')} />;
      title = "Teacher Dashboard";
    } else {
      content = <StudentDashboard user={user} onPlayCourse={(id) => { setActiveCourseId(id); setView('play-course'); }} />;
      title = `Welcome back, ${user.name.split(' ')[0]}!`;
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