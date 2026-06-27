const { EMAIL } = require("../constants");
const CourseModuleModel = require("../Model/CourseModule");

const getModule = async (req, res) => {
  const moduleId = req.params.moduleId;
  try {
    const module = await CourseModuleModel.getModule(moduleId);
    res.status(200).json(module);
  } catch (error) {
    console.log(error.message);
  }
};
const getModules = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    console.log(courseId);
    const modules = await CourseModuleModel.getModulesForCourse(courseId);
    console.log(modules);
    res.status(200).json(modules);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { getModule, getModules };
