const z = require("zod");

const CourseModuleSchema = z.object({
  title: z.string().describe("Name of the Module"),
  description: z.string().describe("Description of the Module"),
});

module.exports = CourseModuleSchema;
