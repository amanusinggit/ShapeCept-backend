const z = require("zod");
const lessonTitleSchema = z.object({
  lessonsObject: z.array(
    z.object({
      lessonTitle: z.string().describe("title of the lesson"),
      lessonConclusion: z.string().describe("conclusion of the lesson"),
    }),
  ),
});
module.exports = lessonTitleSchema;
