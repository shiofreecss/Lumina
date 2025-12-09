import { GoogleGenAI, Type } from "@google/genai";
import { Course } from "../types";

// Schema for structured course generation
const courseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "The title of the course" },
    description: { type: Type.STRING, description: "A short, engaging description" },
    estimatedDuration: { type: Type.STRING, description: "e.g., '4 Weeks' or '10 Hours'" },
    tags: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "3-5 relevant tags" 
    },
    modules: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING, description: "Educational content in Markdown format, at least 300 words. Be detailed and structured." },
                durationMinutes: { type: Type.INTEGER },
                quiz: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "4 options"
                      },
                      correctAnswerIndex: { type: Type.INTEGER, description: "Index of correct option (0-3)" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const generateCourse = async (
  topic: string,
  difficulty: string,
  targetAudience: string,
  duration: string
): Promise<Partial<Course>> => {
  // Use the API key directly from the environment variable as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Create a comprehensive educational course about "${topic}".
    Difficulty Level: ${difficulty}.
    Target Audience: ${targetAudience}.
    Desired Duration: ${duration}.
    
    The course should have 3-5 modules.
    Each module should have 2-3 lessons.
    Each lesson MUST include substantial educational content in Markdown format and a short quiz.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: courseSchema,
        temperature: 0.2,
        systemInstruction: "You are an expert curriculum designer. Create detailed, structured, and accurate educational content."
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from Gemini");

    const data = JSON.parse(jsonText);
    
    // Transform JSON to match our Course interface completely (add IDs)
    const modules = data.modules.map((mod: any, mIdx: number) => ({
      ...mod,
      id: `gen-m-${Date.now()}-${mIdx}`,
      lessons: mod.lessons.map((less: any, lIdx: number) => ({
        ...less,
        id: `gen-l-${Date.now()}-${lIdx}`,
        quiz: less.quiz.map((q: any, qIdx: number) => ({
          ...q,
          id: `gen-q-${Date.now()}-${qIdx}`
        }))
      }))
    }));

    return {
      title: data.title,
      description: data.description,
      estimatedDuration: data.estimatedDuration,
      tags: data.tags,
      modules: modules,
      difficulty: difficulty as any,
      targetAudience: targetAudience,
    };

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};