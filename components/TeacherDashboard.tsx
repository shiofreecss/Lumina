import React, { useEffect, useState } from 'react';
import { Course, User } from '../types';
import { db } from '../services/mockDb';
import { Plus, Users, BookOpen, TrendingUp, Trash2, ExternalLink } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  user: User;
  onCreateClick: () => void;
}

export const TeacherDashboard: React.FC<Props> = ({ user, onCreateClick }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    const all = await db.getCourses();
    setCourses(all.filter(c => c.teacherId === user.id));
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [user.id]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course?")) {
      await db.deleteCourse(id);
      fetchCourses();
    }
  };

  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledCount, 0);

  const data = [
    { name: 'Jan', students: 40 },
    { name: 'Feb', students: 30 },
    { name: 'Mar', students: 20 },
    { name: 'Apr', students: 27 },
    { name: 'May', students: 18 },
    { name: 'Jun', students: 23 },
    { name: 'Jul', students: 34 },
  ];

  if (loading) return <div className="p-10 text-stone-500">Syncing dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: BookOpen, label: "Active Courses", value: courses.length, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", sub: "+2 this week" },
          { icon: Users, label: "Total Students", value: totalStudents, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30", sub: "+12% growth" },
          { icon: TrendingUp, label: "Completion Rate", value: "88%", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", sub: "Top 5% of teachers" }
        ].map((stat, i) => (
          <div key={i} className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-lg shadow-stone-900/5 hover:-translate-y-1 transition-transform duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl`}>
                <stat.icon size={28} />
              </div>
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 bg-white/50 dark:bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm border border-white/20">{stat.sub}</span>
            </div>
            <h3 className="text-4xl font-extrabold text-stone-800 dark:text-stone-100 tracking-tight">{stat.value}</h3>
            <p className="text-stone-500 dark:text-stone-400 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Chart */}
      <div className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-lg shadow-stone-900/5">
        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-8 flex items-center gap-2">
          <TrendingUp className="text-amber-500" />
          Engagement Trends
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f033" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a8a29e'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#a8a29e'}} />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#44403c', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="students" stroke="#f59e0b" strokeWidth={4} fillOpacity={1} fill="url(#colorStudents)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl rounded-[2rem] border border-white/40 dark:border-white/5 shadow-lg shadow-stone-900/5 overflow-hidden">
        <div className="p-8 border-b border-stone-200/50 dark:border-stone-700/50 flex justify-between items-center bg-white/30 dark:bg-stone-800/30">
          <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Your Courses</h3>
          <button 
            onClick={onCreateClick}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 hover:scale-105 transition-all"
          >
            <Plus size={18} strokeWidth={3} />
            <span>New Course</span>
          </button>
        </div>
        <div className="divide-y divide-stone-200/50 dark:divide-stone-700/50">
          {courses.map(course => (
            <div key={course.id} className="p-6 hover:bg-white/50 dark:hover:bg-white/5 transition-colors group flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg text-stone-800 dark:text-stone-200 mb-1">{course.title}</h4>
                <div className="flex items-center space-x-3 mt-1 text-sm font-medium text-stone-500 dark:text-stone-400">
                  <span className="px-3 py-1 bg-stone-100 dark:bg-stone-800 rounded-full">{course.difficulty}</span>
                  <span>•</span>
                  <span>{course.modules.length} Modules</span>
                  <span>•</span>
                  <span>{course.enrolledCount} Students</span>
                </div>
              </div>
              <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                <button 
                  className="p-3 text-stone-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-colors"
                  title="View Analytics"
                >
                  <ExternalLink size={20} />
                </button>
                <button 
                  onClick={() => handleDelete(course.id)}
                  className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                  title="Delete Course"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full mb-4">
                <BookOpen className="text-stone-400" size={32} />
              </div>
              <p className="text-stone-500 dark:text-stone-400 font-medium text-lg">No courses yet. Spark some magic with AI!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};