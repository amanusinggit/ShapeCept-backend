const GoogleGenAI = require("@google/genai").GoogleGenAI;
const { zodToJsonSchema } = require("zod-to-json-schema");
const courseSchema = require("./CoursesSchema");
const { MODEL } = require("../constants");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const returnPrompt = (topic) => {
  return `You are an expert academic curriculum designer from IIT with deep expertise in structuring industry-ready courses.

Your task is to generate a **comprehensive, structured course** on the topic: "${topic}".

Follow these strict guidelines:

1. COURSE QUALITY
- The course should feel like a real university + industry-level program.
- It must be beginner-friendly but progress to advanced concepts.
- Ensure logical flow from fundamentals → intermediate → advanced → real-world applications.

2. STRUCTURE
- Divide the course into well-defined modules.
- Each module should represent a meaningful learning stage.
- Avoid too few or too many modules (ideal: 5–12 modules depending on topic depth).

3. MODULE DESIGN
Each module must:
- Have a clear and concise title.
- Include a description explaining what the learner will achieve.
- Be ordered progressively (no random topics).

4. COURSE METADATA
- Provide a strong, engaging course title.
- Write a clear description explaining what the course covers and who it is for.
- Include relevant tags (5–10 tags).
- Assign a suitable Font Awesome icon class based on the topic.
- Estimate total time required in minutes (realistic learning time).

5. OUTPUT FORMAT (STRICT)
- Return ONLY valid JSON.
- Do NOT include explanations or extra text.
- Follow this exact schema:

{
  "title": string,
  "description": string,
  "tags": string[],
  "modules": [
    {
      "title": string,
      "description": string
    }
  ],
  "icon": string,
  "totalTimeRequired": number
}

6. ADDITIONAL INSTRUCTIONS
- MODULEs SIZE CANNOT BE MORE THAN 2
- Avoid redundancy between modules.
- Ensure modules cover theory + practical + applications (if applicable).
- If the topic is technical, include hands-on or project-oriented modules.
- If the topic is non-technical, include conceptual clarity + real-world use cases.

Return ONLY valid JSON.
MODULES SIZE CANNOT BE MORE THAN 2
Do NOT wrap in markdown.
Do NOT add explanation.
Follow the schema strictly.
Now generate the course for the topic: "${topic}"`;
};

const extractJson = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found");
  return JSON.parse(match[0]);
};

const generateCourse = async (prompt) => {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: returnPrompt(prompt),
    config: {
      responseFormat: {
        text: {
          mimeType: "application/json",
          schema: zodToJsonSchema(courseSchema),
        },
      },
    },
  });
  // console.log("course", response.text);
  const json = extractJson(response.text);
  const course = courseSchema.parse(json);
  return course;
};

module.exports = generateCourse;
