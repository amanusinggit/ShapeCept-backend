const GoogleGenAI = require("@google/genai").GoogleGenAI;
const { zodToJsonSchema } = require("zod-to-json-schema");
const courseSchema = require("./CoursesSchema");
const z = require("zod");
const { MODEL } = require("../constants");
const lessonTitleSchema = require("./LessonTitleSchema");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const returnPrompt = (courseName, moduleName) => {
  return `You are an expert curriculum designer from IIT, skilled at breaking down topics into structured, progressive lessons.

Your task is to generate a list of **lesson titles** for the module: "${moduleName}" for course "${courseName}".

---

### 1. OBJECTIVE

* Break the module into **clear, logically ordered lessons**
* Each lesson should represent a **single focused concept or skill**
* Lessons should collectively cover the module **comprehensively**
* Each lessonConclusion should be at least 300 words and should comprehensively describe the topic in great depth
---

### 2. STRUCTURE RULES

* Generate atmost 2 lesson titles depending on topic complexity
* Maintain a **progressive flow**:

  * Start with fundamentals
  * Move to core concepts
  * Then advanced topics
  * End with applications / practical use (if applicable)

---

### 3. NAMING GUIDELINES

* Keep titles **concise and descriptive**

* Avoid vague names like "Introduction" alone — make it specific
  ✅ "Introduction to React Components"
  ❌ "Introduction"

* Each title should:

  * Clearly indicate what will be learned
  * Avoid redundancy with other lessons
  * Be student-friendly and readable

---

### 4. CONTENT QUALITY

* Ensure **no overlap between lessons**
* Cover both **theory and practical aspects** (if relevant)
* If technical:

  * Include lessons for examples, hands-on, or mini-projects
* If non-technical:

  * Include real-world understanding and applications
* THERE CANNOT BE MORE THAN 2 LESSON TITLE
---

### 5. OUTPUT FORMAT (STRICT)

Return ONLY a valid JSON array of objects:
{
  lessonsObject: [
  {lessonTitle: "Lesson Title 1", lessonConclusion: "Conclusion For Lesson 1 with title lessonTitle"},
  {lessonTitle: "Lesson Title 2", leesonConclusion: "Conclusion For Lesson 2 with title lessonTitle"},
  ]{lessonTitle: "Lesson Title 3", lessonConclusion: "Conclusion For Lesson 3 with title lessonTitle"},
}

Do NOT include explanations or extra text.

---

### 6. FINAL INSTRUCTION

Generate lesson titles for the module:

"${moduleName}"
`;
};

const extractJson = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
};

const generateLessons = async (courseName, moduleName) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: returnPrompt(courseName, moduleName),
    config: {
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: zodToJsonSchema(lessonTitleSchema),
        },
      },
    },
  });
  console.log("lessons", response.text);
  const lessons = lessonTitleSchema.parse(JSON.parse(response.text));
  return lessons;
};

module.exports = generateLessons;
