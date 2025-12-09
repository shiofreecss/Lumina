import React, { useState } from 'react';
import { generateCourse } from '../services/gemini';
import { db } from '../services/mockDb';
import { Course, Module, Lesson } from '../types';
import { Loader2, Wand2, Save, ArrowLeft, RefreshCw, CheckCircle, Edit3, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  teacherId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CourseGenerator: React.FC<Props> = ({ teacherId, onSuccess, onCancel }) => {
  const [step, setStep] = useState<'input' | 'generating' | 'review'>('input');
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'Beginner',
    audience: '',
    duration: ''
  });
  const [generatedCourse, setGeneratedCourse] = useState<Partial<Course> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const handleGenerate = async () => {
    // API Key is now handled internally by the service via process.env.API_KEY
    setStep('generating');
    try {
      const course = await generateCourse(
        formData.topic, 
        formData.difficulty, 
        formData.audience, 
        formData.duration
      );
      setGeneratedCourse(course);
      setStep('review');
    } catch (error) {
      console.error(error);
      alert("Failed to generate course. Please ensure your API key is configured correctly and try again.");
      setStep('input');
    }
  };

  const handleSave = async () => {
    if (!generatedCourse) return;
    setIsSaving(true);
    
    const newCourse: Course = {
      ...generatedCourse,
      id: `c-${Date.now()}`,
      teacherId,
      enrolledCount: 0,
      createdAt: new Date().toISOString(),
      modules: generatedCourse.modules || [],
    } as Course;

    await db.createCourse(newCourse);
    setIsSaving(false);
    onSuccess();
  };

  const updateCourseField = (field: keyof Course, value: any) => {
    if (!generatedCourse) return;
    setGeneratedCourse({ ...generatedCourse, [field]: value });
  };

  const updateModule = (modIndex: number, field: keyof Module, value: any) => {
    if (!generatedCourse || !generatedCourse.modules) return;
    const newModules = [...generatedCourse.modules];
    newModules[modIndex] = { ...newModules[modIndex], [field]: value };
    setGeneratedCourse({ ...generatedCourse, modules: newModules });
  };

  const updateLesson = (modIndex: number, lessonIndex: number, field: keyof Lesson, value: any) => {
    if (!generatedCourse || !generatedCourse.modules) return;
    const newModules = [...generatedCourse.modules];
    const newLessons = [...newModules[modIndex].lessons];
    newLessons[lessonIndex] = { ...newLessons[lessonIndex], [field]: value };
    newModules[modIndex] = { ...newModules[modIndex], lessons: newLessons };
    setGeneratedCourse({ ...generatedCourse, modules: newModules });
  };

  if (step === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-400 rounded-full animate-ping opacity-30"></div>
          <div className="relative bg-white/80 dark:bg-stone-800/80 p-6 rounded-full shadow-2xl backdrop-blur-md border border-white/20">
            <Loader2 className="h-16 w-16 text-amber-500 animate-spin" strokeWidth={1.5} />
          </div>
        </div>
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-stone-800 dark:text-white">Consulting the AI...</h3>
          <p className="text-stone-500 dark:text-stone-400 max-w-md text-lg">
            Gemini Pro is weaving knowledge into a structured curriculum for "{formData.topic}".
          </p>
        </div>
      </div>
    );
  }

  if (step === 'review' && generatedCourse) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between sticky top-4 z-30 p-4 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/5 shadow-lg shadow-stone-900/5 mb-8 gap-4">
          <button onClick={() => setStep('input')} className="text-stone-500 hover:text-amber-600 font-medium flex items-center space-x-2 transition-colors">
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
             <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
                isEditing 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-2 ring-amber-500/20' 
                  : 'bg-white/50 dark:bg-stone-800/50 text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-700'
              }`}
            >
              {isEditing ? <CheckCircle size={18} /> : <Edit3 size={18} />}
              <span className="text-sm md:text-base">{isEditing ? 'Done' : 'Edit'}</span>
            </button>
            <button 
              onClick={handleGenerate} 
              className="flex-1 md:flex-none px-4 md:px-5 py-2.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors"
            >
              <RefreshCw size={18} />
              <span className="text-sm md:text-base">Regenerate</span>
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 md:flex-none px-6 md:px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span className="text-sm md:text-base">Publish</span>
            </button>
          </div>
        </div>

        <div className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl rounded-[2.5rem] border border-white/40 dark:border-white/5 shadow-xl shadow-stone-900/5 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 md:p-10 border-b border-stone-200/50 dark:border-stone-700/50 bg-gradient-to-br from-white/40 to-amber-50/40 dark:from-stone-800/40 dark:to-amber-900/10">
            {isEditing ? (
              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Course Title</label>
                    <input 
                      type="text" 
                      value={generatedCourse.title} 
                      onChange={(e) => updateCourseField('title', e.target.value)}
                      className="w-full p-4 bg-white/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none text-2xl font-bold text-stone-900 dark:text-stone-100"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Description</label>
                    <textarea 
                      value={generatedCourse.description} 
                      onChange={(e) => updateCourseField('description', e.target.value)}
                      className="w-full p-4 bg-white/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none text-base text-stone-700 dark:text-stone-300"
                      rows={3}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                   <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Duration</label>
                      <input 
                        type="text" 
                        value={generatedCourse.estimatedDuration} 
                        onChange={(e) => updateCourseField('estimatedDuration', e.target.value)}
                        className="w-full p-3 bg-white/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl dark:text-stone-200"
                      />
                   </div>
                   <div className="flex-1 space-y-2">
                      <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Difficulty</label>
                      <select 
                        value={generatedCourse.difficulty} 
                        onChange={(e) => updateCourseField('difficulty', e.target.value)}
                        className="w-full p-3 bg-white/50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl dark:text-stone-200"
                      >
                         <option>Beginner</option>
                         <option>Intermediate</option>
                         <option>Advanced</option>
                      </select>
                   </div>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-stone-50 mb-4 leading-tight">{generatedCourse.title}</h1>
                <p className="text-lg md:text-xl text-stone-600 dark:text-stone-300 font-light leading-relaxed">{generatedCourse.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="px-4 py-1.5 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-full text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wide">
                    {generatedCourse.difficulty}
                  </span>
                  <span className="px-4 py-1.5 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm border border-stone-200 dark:border-stone-700 rounded-full text-xs font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wide">
                    {generatedCourse.estimatedDuration}
                  </span>
                  {generatedCourse.tags?.map(tag => (
                    <span key={tag} className="px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold uppercase tracking-wide">
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Modules Section */}
          <div className="p-6 md:p-8 space-y-6 bg-white/20 dark:bg-black/20">
            {generatedCourse.modules?.map((mod, modIdx) => (
              <div key={modIdx} className={`bg-white/60 dark:bg-stone-900/80 backdrop-blur-md rounded-3xl border transition-all duration-300 overflow-hidden ${expandedModule === mod.id ? 'border-amber-400 shadow-lg shadow-amber-500/10' : 'border-white/40 dark:border-white/5 hover:border-amber-300/50'}`}>
                {/* Module Header */}
                <div 
                  className="p-6 flex items-start justify-between cursor-pointer"
                  onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
                >
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="mb-3" onClick={(e) => e.stopPropagation()}>
                        <label className="text-xs font-bold text-amber-600 dark:text-amber-500 uppercase block mb-2">Module {modIdx + 1}</label>
                        <input 
                           type="text" 
                           value={mod.title}
                           onChange={(e) => updateModule(modIdx, 'title', e.target.value)}
                           className="w-full font-bold text-xl p-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 outline-none dark:text-stone-100"
                        />
                      </div>
                    ) : (
                      <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-2">
                        <span className="text-amber-600 dark:text-amber-500 text-sm uppercase block mb-1 tracking-wider">Module {modIdx + 1}</span>
                        {mod.title}
                      </h3>
                    )}
                    
                    {isEditing ? (
                       <div onClick={(e) => e.stopPropagation()}>
                          <textarea 
                            value={mod.description}
                            onChange={(e) => updateModule(modIdx, 'description', e.target.value)}
                            className="w-full text-sm text-stone-600 dark:text-stone-300 p-3 border border-stone-200 dark:border-stone-700 rounded-xl bg-white dark:bg-stone-800 focus:ring-2 focus:ring-amber-500 outline-none"
                            rows={2}
                          />
                       </div>
                    ) : (
                      <p className="text-stone-500 dark:text-stone-400 text-base">{mod.description}</p>
                    )}
                  </div>
                  <div className="ml-6 p-2 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-400">
                     {expandedModule === mod.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                  </div>
                </div>
                
                {/* Lessons List (Collapsible) */}
                {expandedModule === mod.id && (
                  <div className="border-t border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-950/50 p-6 space-y-4">
                    {mod.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-sm">
                        {isEditing ? (
                          <div className="space-y-4">
                             <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Lesson Title</label>
                                  <input 
                                    type="text"
                                    value={lesson.title}
                                    onChange={(e) => updateLesson(modIdx, lIdx, 'title', e.target.value)}
                                    className="w-full font-bold p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl dark:text-stone-100"
                                  />
                                </div>
                                <div className="w-full md:w-24">
                                  <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Mins</label>
                                  <input 
                                    type="number"
                                    value={lesson.durationMinutes}
                                    onChange={(e) => updateLesson(modIdx, lIdx, 'durationMinutes', parseInt(e.target.value))}
                                    className="w-full p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl dark:text-stone-100"
                                  />
                                </div>
                             </div>
                             <div>
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1 block">Content (Markdown)</label>
                                <textarea 
                                  value={lesson.content}
                                  onChange={(e) => updateLesson(modIdx, lIdx, 'content', e.target.value)}
                                  className="w-full p-4 text-sm font-mono bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl h-48 dark:text-stone-300"
                                />
                             </div>
                          </div>
                        ) : (
                          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                            <div>
                               <span className="font-bold text-stone-700 dark:text-stone-200 block text-lg mb-1">{lIdx + 1}. {lesson.title}</span>
                               <span className="text-sm text-stone-400 line-clamp-1">{lesson.content.substring(0, 80)}...</span>
                            </div>
                            <span className="text-stone-500 dark:text-stone-400 text-xs font-bold bg-stone-100 dark:bg-stone-900 px-3 py-1 rounded-full whitespace-nowrap md:ml-4 border border-stone-200 dark:border-stone-700">
                              {lesson.durationMinutes} min • Quiz: {lesson.quiz?.length || 0} Qs
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-stone-900/5 border border-white/40 dark:border-white/5 relative overflow-hidden">
       {/* Decorative */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-400/20 to-yellow-300/20 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none"></div>

      <div className="text-center mb-10 relative z-10">
        <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-600 dark:text-amber-400 rounded-[2rem] mb-6 shadow-inner">
          <Wand2 size={40} />
        </div>
        <h2 className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">AI Course Architect</h2>
        <p className="text-stone-500 dark:text-stone-400 mt-3 text-lg font-medium">Transform any topic into a complete learning journey.</p>
      </div>

      <div className="space-y-8 relative z-10">
        <div className="group">
          <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-3 ml-1">
            Topic
          </label>
          <input
            type="text"
            className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all text-lg font-medium text-stone-900 dark:text-stone-100 placeholder-stone-300 dark:placeholder-stone-600"
            placeholder="e.g. Quantum Computing, Italian Cooking, Art History"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-3 ml-1">
              Difficulty
            </label>
            <div className="relative">
              <select
                className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium appearance-none text-stone-900 dark:text-stone-100"
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
          <div className="group">
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-3 ml-1">
              Duration
            </label>
             <input
              type="text"
              className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-stone-900 dark:text-stone-100"
              placeholder="e.g. 2 Weeks"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>
        </div>

        <div className="group">
            <label className="block text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest mb-3 ml-1">
              Target Audience
            </label>
            <input
              type="text"
              className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all font-medium text-stone-900 dark:text-stone-100"
              placeholder="e.g. Beginners, High School Students"
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
            />
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-end space-y-3 md:space-y-0 md:space-x-4 border-t border-stone-200/50 dark:border-stone-700/50 mt-8">
          <button 
            onClick={onCancel}
            className="w-full md:w-auto px-8 py-3.5 text-stone-500 dark:text-stone-400 font-bold hover:bg-stone-100 dark:hover:bg-stone-800 rounded-2xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!formData.topic}
            className="w-full md:w-auto px-10 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
          >
            <Wand2 size={22} />
            <span>Generate Magic</span>
          </button>
        </div>
      </div>
    </div>
  );
};