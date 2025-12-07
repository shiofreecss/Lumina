import React, { useEffect, useState } from 'react';
import { User, Course, Enrollment } from '../types';
import { db } from '../services/mockDb';
import { Flame, Clock, Trophy, ArrowRight, BookOpen, PlayCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  user: User;
  onPlayCourse: (courseId: string) => void;
}

export const StudentDashboard: React.FC<Props> = ({ user, onPlayCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const allCourses = await db.getCourses();
      const userEnrollments = await db.getEnrollments(user.id);
      setCourses(allCourses);
      setEnrollments(userEnrollments);
      setLoading(false);
    };
    fetchData();
  }, [user.id]);

  const enrolledCourses = courses.filter(c => enrollments.some(e => e.courseId === c.id));
  const availableCourses = courses.filter(c => !enrollments.some(e => e.courseId === c.id));

  const handleEnroll = async (courseId: string) => {
    await db.enroll(user.id, courseId);
    const newEnrollments = await db.getEnrollments(user.id);
    setEnrollments(newEnrollments);
  };

  if (loading) return <div className="p-8 text-center text-stone-500 font-medium text-lg">Loading your learning path...</div>;

  const streakData = [
    { day: 'M', value: 20 },
    { day: 'T', value: 45 },
    { day: 'W', value: 30 },
    { day: 'T', value: 60 },
    { day: 'F', value: user.streak > 0 ? 80 : 10 },
    { day: 'S', value: 0 },
    { day: 'S', value: 0 },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-10">
      {/* Top Section: Stats & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Streak Card - Golden Gradient */}
        <div className="bg-gradient-to-br from-amber-400 to-yellow-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-amber-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
            <Flame size={140} />
          </div>
          <div className="absolute inset-0 bg-noise opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4 bg-white/20 w-fit px-4 py-2 rounded-full backdrop-blur-sm">
              <Flame className="text-white" size={20} fill="currentColor" />
              <span className="font-bold text-white tracking-wide">Daily Streak</span>
            </div>
            <div className="text-7xl font-extrabold mb-4 tracking-tighter drop-shadow-sm">{user.streak}</div>
            <p className="text-amber-100 font-medium text-lg">Keep learning daily to build your fire!</p>
          </div>
        </div>

        {/* Activity Chart - Glass */}
        <div className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 dark:border-white/5 shadow-lg shadow-stone-900/5">
          <h3 className="font-bold text-stone-700 dark:text-stone-200 mb-6 flex items-center text-lg">
            <Clock className="mr-3 text-amber-500" size={24} />
            Learning Activity
          </h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streakData}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} contentStyle={{ borderRadius: '12px', border: 'none', background: '#333', color: '#fff' }} />
                <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                  {streakData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#f59e0b' : '#d6d3d1'} className="transition-all duration-500 hover:opacity-80" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Badge Progress - Glass */}
        <div className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 dark:border-white/5 shadow-lg shadow-stone-900/5 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="flex items-center space-x-5 mb-6">
            <div className="p-4 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/40 dark:to-amber-900/40 text-amber-600 dark:text-amber-400 rounded-2xl shadow-inner">
              <Trophy size={32} />
            </div>
            <div>
              <div className="text-4xl font-extrabold text-stone-800 dark:text-stone-100">{enrollments.filter(e => e.progress === 100).length}</div>
              <div className="text-stone-500 dark:text-stone-400 font-medium">Courses Completed</div>
            </div>
          </div>
          <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-4 mb-3 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 h-4 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ width: '60%' }}></div>
          </div>
          <div className="text-xs font-bold text-stone-400 uppercase tracking-widest text-right">Next: Scholar Lvl 2</div>
        </div>
      </div>

      {/* Enrolled Courses */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2">
            <BookOpen className="text-amber-500" />
            My Courses
        </h2>
        {enrolledCourses.length === 0 ? (
          <div className="p-12 bg-white/30 dark:bg-stone-900/30 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-stone-300 dark:border-stone-700 text-center">
            <p className="text-stone-500 dark:text-stone-400 text-lg mb-4">You haven't enrolled in any courses yet.</p>
            <a href="#browse" className="text-amber-600 dark:text-amber-400 font-bold hover:underline">Browse Catalogue</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrolledCourses.map(course => {
              const enrollment = enrollments.find(e => e.courseId === course.id);
              return (
                <div key={course.id} className="bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl rounded-[2rem] border border-white/50 dark:border-white/10 p-6 flex flex-col hover:-translate-y-2 hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 group">
                  <div className="flex justify-between items-start mb-5">
                    <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold rounded-full uppercase tracking-wide">
                      {course.difficulty}
                    </span>
                    <span className="text-xs font-medium text-stone-400">{course.modules.length} Modules</span>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-2 line-clamp-2 leading-tight">{course.title}</h3>
                  <div className="flex-1"></div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-1">
                      <span>Progress</span>
                      <span className="text-amber-600 dark:text-amber-400">{enrollment?.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-500 to-yellow-400 h-3 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${enrollment?.progress || 0}%` }}
                      ></div>
                    </div>
                    <button 
                      onClick={() => onPlayCourse(course.id)}
                      className="w-full py-3.5 bg-stone-900 dark:bg-white text-white dark:text-stone-900 rounded-2xl text-sm font-bold hover:bg-stone-800 dark:hover:bg-stone-200 flex items-center justify-center space-x-2 transition-all shadow-lg shadow-stone-900/10"
                    >
                      <PlayCircle size={18} />
                      <span>Continue Learning</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Courses */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-6 flex items-center gap-2" id="browse">
            <ArrowRight className="text-amber-500" />
            Explore New Topics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableCourses.map(course => (
            <div key={course.id} className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-lg rounded-[2rem] border border-white/40 dark:border-white/5 p-8 hover:border-amber-400/30 dark:hover:border-amber-600/30 transition-colors group">
              <div className="mb-4">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">{course.estimatedDuration} • {course.targetAudience}</span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 mb-3">{course.title}</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mb-6 line-clamp-3 leading-relaxed">{course.description}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {course.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs bg-white/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-400 px-3 py-1.5 rounded-lg border border-white/20 dark:border-white/5 font-medium">#{tag}</span>
                ))}
              </div>
              <button 
                onClick={() => handleEnroll(course.id)}
                className="w-full py-3 border-2 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 rounded-2xl text-sm font-bold hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 dark:hover:border-amber-500 transition-all bg-transparent"
              >
                Enroll Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};