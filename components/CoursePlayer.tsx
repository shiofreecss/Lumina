import React, { useState, useEffect } from 'react';
import { Course, Enrollment, Lesson, QuizQuestion } from '../types';
import { db } from '../services/mockDb';
import { CheckCircle, Circle, ChevronRight, ArrowLeft, Trophy, Play } from 'lucide-react';

interface Props {
  courseId: string;
  studentId: string;
  onExit: () => void;
}

export const CoursePlayer: React.FC<Props> = ({ courseId, studentId, onExit }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [quizMode, setQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const load = async () => {
      const c = await db.getCourseById(courseId);
      const e = (await db.getEnrollments(studentId)).find(en => en.courseId === courseId);
      if (c && e) {
        setCourse(c);
        setEnrollment(e);
        const allLessons = c.modules.flatMap(m => m.lessons);
        const firstIncomplete = allLessons.find(l => !e.completedLessonIds.includes(l.id));
        setActiveLesson(firstIncomplete || allLessons[0]);
      }
    };
    load();
  }, [courseId, studentId]);

  if (!course || !enrollment || !activeLesson) return <div className="p-20 text-center text-stone-500 dark:text-stone-400">Loading course environment...</div>;

  const isCompleted = (lessonId: string) => enrollment.completedLessonIds.includes(lessonId);

  const handleCompleteLesson = async () => {
    if (activeLesson.quiz && activeLesson.quiz.length > 0 && !quizSubmitted) {
      setQuizMode(true);
      return;
    }

    await db.completeLesson(studentId, courseId, activeLesson.id);
    const updatedE = (await db.getEnrollments(studentId)).find(en => en.courseId === courseId);
    if (updatedE) setEnrollment(updatedE);

    const allLessons = course.modules.flatMap(m => m.lessons);
    const currIdx = allLessons.findIndex(l => l.id === activeLesson.id);
    if (currIdx < allLessons.length - 1) {
      setActiveLesson(allLessons[currIdx + 1]);
      setQuizMode(false);
      setQuizSubmitted(false);
      setQuizAnswers({});
    } else {
      alert("Congratulations! You've completed the course!");
      onExit();
    }
  };

  const submitQuiz = () => {
    if (!activeLesson.quiz) return;
    let correct = 0;
    activeLesson.quiz.forEach((q, idx) => {
      if (quizAnswers[q.id] === q.correctAnswerIndex) correct++;
    });
    setScore((correct / activeLesson.quiz.length) * 100);
    setQuizSubmitted(true);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] overflow-hidden bg-white/70 dark:bg-stone-900/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 dark:border-white/5 relative z-10">
      {/* Sidebar */}
      <div className="w-80 bg-white/40 dark:bg-black/20 border-r border-stone-200/50 dark:border-stone-800/50 flex flex-col">
        <div className="p-6 border-b border-stone-200/50 dark:border-stone-800/50 bg-stone-50/30 dark:bg-stone-900/30">
          <button onClick={onExit} className="flex items-center text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 text-sm font-bold mb-4 transition-colors">
            <ArrowLeft size={18} className="mr-1" /> Back to Dashboard
          </button>
          <h2 className="font-extrabold text-stone-900 dark:text-stone-100 leading-tight mb-3">{course.title}</h2>
          
          <div className="flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400 mb-1">
            <span>Course Progress</span>
            <span>{enrollment.progress}%</span>
          </div>
          <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 h-2 rounded-full transition-all duration-700" style={{ width: `${enrollment.progress}%` }}></div>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
          {course.modules.map((module, idx) => (
            <div key={module.id}>
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-3 pl-3">Module {idx + 1}: {module.title}</h3>
              <div className="space-y-1">
                {module.lessons.map((lesson) => {
                   const isActive = activeLesson.id === lesson.id;
                   const completed = isCompleted(lesson.id);
                   
                   return (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        setActiveLesson(lesson);
                        setQuizMode(false);
                        setQuizSubmitted(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-sm flex items-center transition-all duration-300 group ${
                        isActive
                          ? 'bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 font-bold ring-1 ring-amber-500/20' 
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
                      }`}
                    >
                      {completed ? (
                        <CheckCircle size={18} className="text-emerald-500 mr-3 flex-shrink-0" fill="currentColor" stroke="white" />
                      ) : isActive ? (
                        <Play size={18} className="text-amber-500 mr-3 flex-shrink-0 fill-current" />
                      ) : (
                        <Circle size={18} className="text-stone-300 dark:text-stone-700 mr-3 flex-shrink-0" />
                      )}
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 md:p-16 relative scroll-smooth">
        <div className="max-w-3xl mx-auto pb-20">
          {quizMode && activeLesson.quiz ? (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-center space-x-4 mb-8">
                  <div className="p-4 bg-gradient-to-br from-amber-200 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 rounded-2xl shadow-lg shadow-amber-500/10 text-amber-700 dark:text-amber-300">
                    <Trophy size={32} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-extrabold text-stone-900 dark:text-white">Knowledge Check</h1>
                    <p className="text-stone-500 dark:text-stone-400">Test your understanding of {activeLesson.title}</p>
                  </div>
                </div>

                {activeLesson.quiz.map((q, idx) => (
                  <div key={q.id} className="bg-white/60 dark:bg-stone-800/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/40 dark:border-white/5 shadow-sm">
                    <p className="font-bold text-xl text-stone-800 dark:text-stone-200 mb-6 flex gap-2">
                       <span className="text-amber-500">Q{idx + 1}.</span> 
                       {q.question}
                    </p>
                    <div className="space-y-3">
                      {q.options.map((opt, optIdx) => {
                        let btnClass = "w-full text-left p-4 rounded-2xl border-2 transition-all font-medium text-lg relative overflow-hidden";
                        if (quizSubmitted) {
                          if (optIdx === q.correctAnswerIndex) btnClass += " border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300";
                          else if (quizAnswers[q.id] === optIdx) btnClass += " border-red-300 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
                          else btnClass += " border-transparent bg-stone-50 dark:bg-stone-900/50 text-stone-400 dark:text-stone-600";
                        } else if (quizAnswers[q.id] === optIdx) {
                          btnClass += " border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100 shadow-md";
                        } else {
                          btnClass += " border-transparent bg-stone-100 dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800";
                        }
                        
                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setQuizAnswers({...quizAnswers, [q.id]: optIdx})}
                            className={btnClass}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {quizSubmitted ? (
                  <div className="p-8 bg-gradient-to-br from-stone-100 to-white dark:from-stone-800 dark:to-stone-900 rounded-[2rem] text-center shadow-inner border border-stone-200 dark:border-stone-700">
                    <p className="text-3xl font-black text-stone-800 dark:text-white mb-2">{Math.round(score)}% Score</p>
                    <p className="text-stone-500 dark:text-stone-400 mb-6">
                      {score >= 70 ? "Great job! You've mastered this lesson." : "Review the material and try again to improve."}
                    </p>
                    {score >= 70 ? (
                       <button onClick={handleCompleteLesson} className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all hover:-translate-y-1">
                         Continue Journey
                       </button>
                    ) : (
                      <button onClick={() => { setQuizSubmitted(false); setQuizAnswers({}); }} className="px-8 py-3 bg-stone-800 text-white dark:bg-white dark:text-stone-900 rounded-2xl font-bold text-lg hover:opacity-90 transition-all">
                        Retry Quiz
                      </button>
                    )}
                  </div>
                ) : (
                   <button 
                    onClick={submitQuiz}
                    disabled={Object.keys(quizAnswers).length !== activeLesson.quiz.length}
                    className="w-full py-5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-xl rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none disabled:shadow-none"
                  >
                    Submit Answers
                  </button>
                )}
             </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-full uppercase tracking-wider">Lesson</span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-stone-900 dark:text-white leading-tight tracking-tight">{activeLesson.title}</h1>
              </div>

              {/* Enhanced Typography for Lesson Content */}
              <div className="prose prose-stone dark:prose-invert prose-lg max-w-none mb-16">
                 {/* Simulate content rendering with better styling */}
                 <div className="text-lg leading-loose text-stone-700 dark:text-stone-300 font-light space-y-6">
                    {activeLesson.content.split('\n').map((para, i) => (
                      <p key={i} className={i === 0 ? "text-xl font-normal text-stone-800 dark:text-stone-200" : ""}>{para}</p>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end pt-10 border-t border-stone-200 dark:border-stone-700">
                <button
                  onClick={handleCompleteLesson}
                  className="group flex items-center space-x-3 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-all shadow-xl shadow-stone-900/20 hover:-translate-y-1"
                >
                  <span>{activeLesson.quiz && activeLesson.quiz.length > 0 ? "Take Quiz" : "Complete Lesson"}</span>
                  <div className="bg-white/20 dark:bg-black/10 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                     <ChevronRight size={20} />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};