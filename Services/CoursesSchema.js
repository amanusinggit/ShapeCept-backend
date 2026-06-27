const z = require("zod");
const CourseModuleSchema = require("./ModuleSchema");

const CourseSchema = z.object({
  title: z.string().describe("Name of the Course"),
  description: z.string().describe("Description of the Course"),
  tags: z.array(z.string()),
  modules: z.array(CourseModuleSchema),
  icon: z
    .string()
    .describe("font awesome class for representing an icon based on course"),
  totalTimeRequired: z
    .number()
    .describe("Approximate Time to complete all the modules."),
});

module.exports = CourseSchema;
