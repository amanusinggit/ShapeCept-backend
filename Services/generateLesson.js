const GoogleGenAI = require("@google/genai").GoogleGenAI;
const { zodToJsonSchema } = require("zod-to-json-schema");
const courseSchema = require("./CoursesSchema");
const z = require("zod");
const lessonSchema = require("./LessonSchema");
const { MODEL } = require("../constants");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const returnPrompt = (courseName, moduleName, lessonName) => {
  return `You are an expert educator and instructional designer from IIT, specializing in creating highly engaging, structured learning content.

Your task is to generate a **complete lesson content array** based on the lesson name: "${lessonName}" for module: "${moduleName}" for course: "${courseName}". The lesson content generated must be relative to the moduleName and courseName domain.

---

### 1. OUTPUT FORMAT (STRICT)

* Return ONLY a valid JavaScript array.
* Do NOT include explanations or extra text.
* Follow this exact structure:
{
lesson: [
{ type: "heading", text: string },

{ type: "paragraph", text: string },

{ type: "image", url: string, caption: string },

{ type: "list", items: string[] },

{ type: "code", language: string, text: string },

{ type: "video", url: string, title: string },

{ type: "table", headers: string[], rows: string[][] },

{ type: "quote", text: string, author: string },

{ type: "mcq", question: string, options: string[], answer: string },

{ type: "fill_blank", question: string, answer: string },

{ type: "true_false", question: string, answer: boolean }
]
}
---

### 2. CONTENT GUIDELINES

* The lesson must be **comprehensive and well-structured**.
* Start with an introduction and end with a conclusion.
* Use multiple headings to break content into logical sections.
* Maintain a **progressive flow** (basic → intermediate → advanced).

---

### 3. REQUIRED ELEMENTS

* Generate a structured lesson using only: heading, paragraph, code, video, mcq.
* Do NOT include any other types (strict rule).
* Include multiple headings with explanatory paragraphs under each.
* Add at least 2 code blocks (for technical topics), code blocks are not required for topics which are not technichal
* Include at least 1 video reference.
* End the lesson with 3–4 MCQs (mandatory).
* Return output strictly in the required JSON format with a lesson array.

---

### 4. QUALITY RULES

* Content must be **accurate and educational**
* Avoid repetition
* Keep paragraphs clear and concise
* Code examples should be simple and relevant
* Questions (MCQ, etc.) should test understanding, not trivial facts
* The lesson must be comprehesive, It can be as long as possible, but it should cover the topics in depth.
---

### 5. ADAPTABILITY

* If the lesson is technical → include code, examples, and practical insights
* If non-technical → focus on concepts, analogies, and real-world applications

---

### 6. FINAL INSTRUCTION

Generate the lesson content for:

lessonName: "${lessonName}" moduleName: "${moduleName}" courseName: "${courseName}"
`;
};

const extractJson = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
};

const generateLesson = async (courseName, moduleName, lessonName) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: returnPrompt(courseName, moduleName, lessonName),
    config: {
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: zodToJsonSchema(lessonSchema),
        },
      },
    },
  });
  //   console.log("lesson", response.text);
  //   const json = extractJson(response.text);
  const lesson = lessonSchema.parse(JSON.parse(response.text));
  return lesson;
};

module.exports = generateLesson;
