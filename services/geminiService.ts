import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const askMedicalTutor = async (
  question: string, 
  currentContext: string
): Promise<string> => {
  const client = getClient();
  if (!client) return "Ошибка конфигурации: Отсутствует API ключ.";

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Ты опытный кардиолог и преподаватель. Твоя задача - отвечать на вопросы студентов или пациентов о сердце, инфаркте миокарда и чрескожном коронарном вмешательстве (стентировании).
        
        Текущий контекст урока: ${currentContext}

        Вопрос пользователя: ${question}

        Отвечай кратко, профессионально, но понятно. Используй форматирование markdown, если нужно.
      `,
    });
    
    return response.text || "Извините, я не смог сгенерировать ответ.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Произошла ошибка при обращении к ассистенту.";
  }
};