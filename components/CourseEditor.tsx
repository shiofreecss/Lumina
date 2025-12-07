import React, { useState, useEffect } from 'react';
import { Course, Module, Lesson, Resource } from '../types';
import { db } from '../services/mockDb';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Trash2, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  MonitorPlay, 
  Presentation,
  Link
} from 'lucide-react';

interface Props {
  courseId: string;
  onClose: () => void;
}

export const CourseEditor: React.FC<Props> = ({ courseId, onClose }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const data = await db.getCourseById(courseId);
      if (data) {
        setCourse(data);
        // Expand first module by default
        if (data.modules.length > 0) setExpandedModule(data.modules[0].id);
      }
      setLoading(false);
    };
    fetchCourse();
  }, [courseId]);

  const handleSave = async () => {
    if (!course) return;
    setSaving(true);
    await db.updateCourse(course);
    setSaving(false);
    onClose();
  };

  const updateCourseField = (field: keyof Course, value: any) => {
    if (!course) return;
    setCourse({ ...course, [field]: value });
  };

  const updateModule = (modIdx: number, field: keyof Module, value: any) => {
    if (!course) return;
    const newModules = [...course.modules];
    newModules[modIdx] = { ...newModules[modIdx], [field]: value };
    setCourse({ ...course, modules: newModules });
  };

  const deleteModule = (modIdx: number) => {
    if (!course || !confirm("Delete this module and all its lessons?")) return;
    const newModules = [...course.modules];
    newModules.splice(modIdx, 1);
    setCourse({ ...course, modules: newModules });
  };

  const addModule = () => {
    if (!course) return;
    const newModule: Module = {
      id: `m-${Date.now()}`,
      title: 'New Module',
      description: 'Module description...',
      lessons: []
    };
    setCourse({ ...course, modules: [...course.modules, newModule] });
    setExpandedModule(newModule.id);
  };

  const updateLesson = (modIdx: number, lIdx: number, field: keyof Lesson, value: any) => {
    if (!course) return;
    const newModules = [...course.modules];
    const newLessons = [...newModules[modIdx].lessons];
    newLessons[lIdx] = { ...newLessons[lIdx], [field]: value };
    newModules[modIdx] = { ...newModules[modIdx], lessons: newLessons };
    setCourse({ ...course, modules: newModules });
  };

  const deleteLesson = (modIdx: number, lIdx: number) => {
    if (!course || !confirm("Delete this lesson?")) return;
    const newModules = [...course.modules];
    newModules[modIdx].lessons.splice(lIdx, 1);
    setCourse({ ...course, modules: newModules });
  };

  const addLesson = (modIdx: number) => {
    if (!course) return;
    const newModules = [...course.modules];
    const newLesson: Lesson = {
      id: `l-${Date.now()}`,
      title: 'New Lesson',
      content: 'Start writing your lesson content here...',
      durationMinutes: 15,
      resources: []
    };
    newModules[modIdx].lessons.push(newLesson);
    setCourse({ ...course, modules: newModules });
  };

  // Resource Management
  const addResource = (modIdx: number, lIdx: number) => {
    if (!course) return;
    const newModules = [...course.modules];
    const newLessons = [...newModules[modIdx].lessons];
    const currentResources = newLessons[lIdx].resources || [];
    
    // Simple prompt for now to get details, can be replaced with a modal
    const title = prompt("Resource Title (e.g., 'Lecture Slides')");
    if (!title) return;
    const url = prompt("Resource URL (e.g., Google Slides link, PDF link)");
    if (!url) return;
    const typeStr = prompt("Type: slide, document, or video")?.toLowerCase();
    const type: 'slide' | 'document' | 'video' = 
      (typeStr === 'slide' || typeStr === 'document' || typeStr === 'video') ? typeStr : 'document';

    newLessons[lIdx] = {
      ...newLessons[lIdx],
      resources: [...currentResources, { id: `r-${Date.now()}`, title, url, type }]
    };
    newModules[modIdx] = { ...newModules[modIdx], lessons: newLessons };
    setCourse({ ...course, modules: newModules });
  };

  const removeResource = (modIdx: number, lIdx: number, rIdx: number) => {
    if (!course) return;
    const newModules = [...course.modules];
    const newLessons = [...newModules[modIdx].lessons];
    const newResources = [...(newLessons[lIdx].resources || [])];
    newResources.splice(rIdx, 1);
    newLessons[lIdx] = { ...newLessons[lIdx], resources: newResources };
    newModules[modIdx] = { ...newModules[modIdx], lessons: newLessons };
    setCourse({ ...course, modules: newModules });
  };

  if (loading) return <div className="p-20 text-center text-stone-500">Loading editor...</div>;
  if (!course) return <div className="p-20 text-center text-red-500">Course not found.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Sticky Header */}
      <div className="sticky top-4 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200 dark:border-stone-700 p-4 rounded-2xl shadow-lg mb-8 flex justify-between items-center">
        <button onClick={onClose} className="flex items-center space-x-2 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 font-bold transition-colors">
          <ArrowLeft size={20} />
          <span>Cancel</span>
        </button>
        <h1 className="text-lg font-bold text-stone-800 dark:text-white hidden md:block truncate max-w-md">Editing: {course.title}</h1>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          <span>Save Changes</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Course Info Card */}
        <div className="bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl p-8 rounded-[2rem] border border-stone-200 dark:border-stone-700 shadow-sm">
          <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-6">Course Details</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Title</label>
              <input 
                value={course.title}
                onChange={(e) => updateCourseField('title', e.target.value)}
                className="w-full p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-bold text-xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                value={course.description}
                onChange={(e) => updateCourseField('description', e.target.value)}
                className="w-full p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 dark:text-stone-300"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Difficulty</label>
                  <select 
                    value={course.difficulty}
                    onChange={(e) => updateCourseField('difficulty', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none dark:text-stone-300"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Duration</label>
                  <input 
                    value={course.estimatedDuration}
                    onChange={(e) => updateCourseField('estimatedDuration', e.target.value)}
                    className="w-full p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl outline-none dark:text-stone-300"
                  />
               </div>
            </div>
          </div>
        </div>

        {/* Modules & Lessons */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-white">Curriculum</h2>
            <button 
              onClick={addModule}
              className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 px-4 py-2 rounded-xl transition-colors"
            >
              <Plus size={20} />
              <span>Add Module</span>
            </button>
          </div>

          {course.modules.map((mod, modIdx) => (
            <div key={mod.id} className={`bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl border transition-all duration-300 rounded-3xl overflow-hidden ${expandedModule === mod.id ? 'border-amber-500 shadow-lg shadow-amber-500/10' : 'border-stone-200 dark:border-stone-700 hover:border-amber-300'}`}>
              
              {/* Module Header */}
              <div 
                className="p-6 flex items-start justify-between cursor-pointer bg-stone-50/50 dark:bg-stone-800/30"
                onClick={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}
              >
                <div className="flex-1 space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-4">
                     <span className="text-xs font-black text-amber-500 uppercase tracking-widest whitespace-nowrap">Module {modIdx + 1}</span>
                     <button onClick={() => deleteModule(modIdx)} className="text-stone-400 hover:text-red-500 transition-colors" title="Delete Module">
                       <Trash2 size={16} />
                     </button>
                  </div>
                  <input 
                    value={mod.title}
                    onChange={(e) => updateModule(modIdx, 'title', e.target.value)}
                    className="w-full bg-transparent font-bold text-xl outline-none text-stone-800 dark:text-stone-100 placeholder-stone-400"
                    placeholder="Module Title"
                  />
                  <input 
                    value={mod.description}
                    onChange={(e) => updateModule(modIdx, 'description', e.target.value)}
                    className="w-full bg-transparent text-sm text-stone-500 dark:text-stone-400 outline-none"
                    placeholder="Brief description of this module..."
                  />
                </div>
                <div className="ml-4 p-2">
                  {expandedModule === mod.id ? <ChevronUp className="text-stone-400" /> : <ChevronDown className="text-stone-400" />}
                </div>
              </div>

              {/* Lessons Area */}
              {expandedModule === mod.id && (
                <div className="p-6 space-y-6 border-t border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-950">
                  {mod.lessons.map((lesson, lIdx) => (
                    <div key={lesson.id} className="p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50">
                      
                      {/* Lesson Header */}
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 block">Lesson Title</label>
                          <input 
                            value={lesson.title}
                            onChange={(e) => updateLesson(modIdx, lIdx, 'title', e.target.value)}
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg font-bold text-stone-800 dark:text-stone-100 outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="w-full md:w-32">
                          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 block">Duration (min)</label>
                          <input 
                            type="number"
                            value={lesson.durationMinutes}
                            onChange={(e) => updateLesson(modIdx, lIdx, 'durationMinutes', parseInt(e.target.value))}
                            className="w-full p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg font-bold text-stone-800 dark:text-stone-100 outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <button onClick={() => deleteLesson(modIdx, lIdx)} className="p-2.5 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {/* Content Editor */}
                      <div className="mb-6">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 block flex items-center gap-2">
                          <FileText size={12} />
                          Lesson Content (Markdown)
                        </label>
                        <textarea 
                          value={lesson.content}
                          onChange={(e) => updateLesson(modIdx, lIdx, 'content', e.target.value)}
                          className="w-full p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl font-mono text-sm h-32 outline-none focus:ring-2 focus:ring-amber-500 dark:text-stone-300 resize-y"
                        />
                      </div>

                      {/* Resources Section */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                           <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                              <Link size={12} />
                              Resources (Slides & Docs)
                           </label>
                           <button 
                            onClick={() => addResource(modIdx, lIdx)}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                           >
                             <Plus size={14} /> Add Resource
                           </button>
                        </div>
                        
                        {(lesson.resources && lesson.resources.length > 0) ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {lesson.resources.map((res, rIdx) => (
                              <div key={res.id} className="flex items-center justify-between p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div className={`p-2 rounded-lg ${res.type === 'slide' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {res.type === 'slide' ? <Presentation size={16} /> : <FileText size={16} />}
                                  </div>
                                  <div className="truncate">
                                    <p className="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">{res.title}</p>
                                    <p className="text-xs text-stone-400 truncate">{res.url}</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => removeResource(modIdx, lIdx, rIdx)}
                                  className="text-stone-400 hover:text-red-500 p-2"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-4 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl text-center">
                            <p className="text-xs text-stone-400">No slides or documents attached.</p>
                          </div>
                        )}
                      </div>

                    </div>
                  ))}
                  <button 
                    onClick={() => addLesson(modIdx)}
                    className="w-full py-3 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl text-stone-500 font-bold hover:border-amber-400 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add Lesson
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper for icon
const X = ({ size }: { size: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
