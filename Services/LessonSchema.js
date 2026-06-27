const z = require("zod");
const CourseModuleSchema = require("./ModuleSchema");

const MCQSchema = z.object({
  type: z.literal("mcq"),
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
});
const ParagraphSchema = z.object({
  type: z.literal("paragraph"),
  text: z.string(),
});
const HeadingSchema = z.object({
  type: z.literal("heading"),
  text: z.string(),
});
const CodeSchema = z.object({
  type: z.literal("code"),
  text: z.string().describe("code"),
  language: z.string("language of the code"),
});
const VideoSchema = z.object({
  type: z.literal("video"),
  url: z.string().describe("youtube id for the video"),
  title: z.string("Title of the video"),
});

const lessonSchema = z.object({
  lesson: z.array(
    z.discriminatedUnion("type", [
      MCQSchema,
      ParagraphSchema,
      HeadingSchema,
      CodeSchema,
      VideoSchema,
    ]),
  ),
});

module.exports = lessonSchema;
