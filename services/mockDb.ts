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
            resources: [
              { id: 'r-1', title: 'Solar System Slides', type: 'slide', url: '#' },
              { id: 'r-2', title: 'NASA Fact Sheet', type: 'document', url: '#' }
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
    description: 'Master React, TypeScript, and Tailwind CSS to build stunning, responsive user interfaces.',
    difficulty: 'Intermediate',
    targetAudience: 'Web Developers',
    estimatedDuration: '6 Weeks',
    enrolledCount: 45,
    tags: ['React', 'Frontend', 'Web'],
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
            content: 'React components are the building blocks of your application. JSX allows you to write HTML-like syntax directly in your JavaScript.',
            durationMinutes: 15,
            quiz: [{ id: 'q-fe-1', question: 'What is JSX?', options: ['JavaScript XML', 'Java Syntax', 'JSON X', 'Java Source'], correctAnswerIndex: 0 }]
          },
          {
            id: 'l-fe-2',
            title: 'Hooks in Depth',
            content: 'Hooks allow function components to have access to state and other React features. useState and useEffect are the most common.',
            durationMinutes: 20,
            quiz: [{ id: 'q-fe-2', question: 'Which hook handles side effects?', options: ['useState', 'useReducer', 'useEffect', 'useContext'], correctAnswerIndex: 2 }]
          }
        ]
      }
    ]
  },
  {
    id: 'c-backend',
    teacherId: 'teacher-1',
    title: 'Scalable Backend Systems',
    description: 'Build robust APIs, manage databases, and deploy scalable microservices using Node.js.',
    difficulty: 'Advanced',
    targetAudience: 'Software Engineers',
    estimatedDuration: '8 Weeks',
    enrolledCount: 32,
    tags: ['Node.js', 'Database', 'API'],
    createdAt: new Date().toISOString(),
    modules: [
      {
        id: 'm-be-1',
        title: 'API Design',
        description: 'REST vs GraphQL architectures.',
        lessons: [
          {
            id: 'l-be-1',
            title: 'RESTful Principles',
            content: 'Representational State Transfer (REST) is a software architectural style that defines a set of constraints to be used for creating Web services.',
            durationMinutes: 20,
            quiz: [{ id: 'q-be-1', question: 'Which HTTP method is typically used for creating resources?', options: ['GET', 'POST', 'PUT', 'DELETE'], correctAnswerIndex: 1 }]
          }
        ]
      },
      {
        id: 'm-be-2',
        title: 'Database Management',
        description: 'SQL vs NoSQL trade-offs.',
        lessons: [
            {
              id: 'l-be-2',
              title: 'ACID Properties',
              content: 'Atomicity, Consistency, Isolation, Durability are the key properties of database transactions.',
              durationMinutes: 25,
              quiz: [{ id: 'q-be-2', question: 'What does the A in ACID stand for?', options: ['Automated', 'Atomic', 'Atomicity', 'Async'], correctAnswerIndex: 2 }]
            }
        ]
      }
    ]
  },
  {
    id: 'c-uiux',
    teacherId: 'teacher-1',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn to create user-centric designs, wireframes, and interactive prototypes using Figma.',
    difficulty: 'Beginner',
    targetAudience: 'Designers, Product Managers',
    estimatedDuration: '4 Weeks',
    enrolledCount: 88,
    tags: ['Design', 'Figma', 'UX'],
    createdAt: new Date().toISOString(),
    modules: [
      {
        id: 'm-ui-1',
        title: 'Design Thinking',
        description: 'Empathize, Define, Ideate.',
        lessons: [
          {
            id: 'l-ui-1',
            title: 'Empathy Maps',
            content: 'Understanding the user is the first step in the design process. Empathy maps help visualize user needs.',
            durationMinutes: 12,
            quiz: [{ id: 'q-ui-1', question: 'What is the first stage of Design Thinking?', options: ['Prototype', 'Test', 'Empathize', 'Ideate'], correctAnswerIndex: 2 }]
          }
        ]
      }
    ]
  },
  {
    id: 'c-vibecoding',
    teacherId: 'teacher-1',
    title: 'The Art of Vibecoding',
    description: 'Coding with intuition, flow state, and AI collaboration for maximum creativity and speed.',
    difficulty: 'Intermediate',
    targetAudience: 'Creative Coders',
    estimatedDuration: '2 Weeks',
    enrolledCount: 150,
    tags: ['Flow', 'Creativity', 'AI'],
    createdAt: new Date().toISOString(),
    modules: [
      {
        id: 'm-vc-1',
        title: 'Setting the Vibe',
        description: 'Environment and Mindset optimization.',
        lessons: [
          {
            id: 'l-vc-1',
            title: 'The Flow State',
            content: 'Flow is the mental state of operation in which a person performing an activity is fully immersed in a feeling of energized focus.',
            durationMinutes: 10,
            quiz: [{ id: 'q-vc-1', question: 'What characterizes flow state?', options: ['Anxiety', 'Boredom', 'Deep Focus', 'Distraction'], correctAnswerIndex: 2 }]
          }
        ]
      },
      {
        id: 'm-vc-2',
        title: 'AI Pair Programming',
        description: 'Dancing with the LLM.',
        lessons: [
            {
                id: 'l-vc-2',
                title: 'Prompt as Dialogue',
                content: 'Treating the AI not as a tool, but as a collaborative partner to bounce ideas off of.',
                durationMinutes: 15,
                quiz: [{ id: 'q-vc-2', question: 'What is the key to vibecoding with AI?', options: ['Copy-pasting', 'Iterative Dialogue', 'Ignoring output', 'Using one prompt'], correctAnswerIndex: 1 }]
            }
        ]
      }
    ]
  },
  {
    id: 'c-llm',
    teacherId: 'teacher-1',
    title: 'LLM Architectures & Prompting',
    description: 'Deep dive into Transformers, attention mechanisms, and advanced prompt engineering strategies.',
    difficulty: 'Advanced',
    targetAudience: 'AI Researchers, Engineers',
    estimatedDuration: '6 Weeks',
    enrolledCount: 65,
    tags: ['AI', 'LLM', 'Transformers'],
    createdAt: new Date().toISOString(),
    modules: [
      {
        id: 'm-llm-1',
        title: 'Transformers',
        description: 'Attention is All You Need.',
        lessons: [
          {
            id: 'l-llm-1',
            title: 'Self-Attention Mechanism',
            content: 'Self-attention allows the model to weigh the importance of different words in a sentence regardless of their distance.',
            durationMinutes: 25,
            quiz: [{ id: 'q-llm-1', question: 'What replaced RNNs in modern NLP?', options: ['CNNs', 'Transformers', 'LSTMs', 'GANs'], correctAnswerIndex: 1 }]
          }
        ]
      }
    ]
  },
  {
    id: 'c-finetuning',
    teacherId: 'teacher-1',
    title: 'AI Labeling & Fine-Tuning',
    description: 'Learn how to curate datasets and fine-tune models for specific domain tasks using modern techniques.',
    difficulty: 'Advanced',
    targetAudience: 'ML Engineers',
    estimatedDuration: '5 Weeks',
    enrolledCount: 40,
    tags: ['Data', 'Fine-tuning', 'MLOps'],
    createdAt: new Date().toISOString(),
    modules: [
      {
        id: 'm-ft-1',
        title: 'Data Preparation',
        description: 'Quality over Quantity.',
        lessons: [
          {
            id: 'l-ft-1',
            title: 'Data Annotation Strategies',
            content: 'High quality labels are essential for supervised fine-tuning. Learn about rater agreement and gold sets.',
            durationMinutes: 18,
            quiz: [{ id: 'q-ft-1', question: 'What is RLHF?', options: ['Reinforcement Learning from Human Feedback', 'Real Learning High Frequency', 'Random Labeling Heuristic Function', 'None of above'], correctAnswerIndex: 0 }]
          }
        ]
      },
      {
        id: 'm-ft-2',
        title: 'LoRA and PEFT',
        description: 'Parameter Efficient Fine-Tuning.',
        lessons: [
            {
                id: 'l-ft-2',
                title: 'Low-Rank Adaptation',
                content: 'LoRA allows fine-tuning large models by freezing weights and injecting trainable rank decomposition matrices.',
                durationMinutes: 22,
                quiz: [{ id: 'q-ft-2', question: 'Does LoRA update all model weights?', options: ['Yes', 'No', 'Sometimes', 'Only bias terms'], correctAnswerIndex: 1 }]
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

  async updateCourse(course: Course): Promise<void> {
    await delay(800);
    let courses = this.get<Course[]>('courses', INITIAL_COURSES);
    courses = courses.map(c => c.id === course.id ? course : c);
    this.set('courses', courses);
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