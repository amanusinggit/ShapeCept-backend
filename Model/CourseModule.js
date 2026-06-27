const mongoose = require("mongoose");
const Lesson = require("./Lesson");
const Course = require("./Course");

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  course: { type: mongoose.ObjectId, ref: "Course" },

  completed: { type: Boolean },
  // schema: { type: mongoose.ObjectId, ref: "schema" },
  // lessons: [{ type: mongoose.ObjectId, ref: "Lesson" }],
});

schema.statics.addModule = async function (moduleData, session) {
  try {
    const [newModule] = await CourseModule.create([moduleData], { session });
    await newModule.save({ session });
    return newModule._id;
  } catch (error) {
    throw error;
  }
};
schema.statics.getModule = async function (moduleId) {
  try {
    const existingModule = await CourseModule.find({ _id: moduleId });
    if (existingModule.length === 0) {
      throw Error("No Existing Lessons");
    }
    return existingModule;
  } catch (error) {
    console.log("error:", error.message);
  }
};
schema.statics.getModulesForCourse = async function (courseId) {
  try {
    const existingModules = await CourseModule.find({ course: courseId });
    return existingModules;
  } catch (error) {
    console.log("error:", error.message);
  }
};
schema.statics.markAsCompleted = async function (moduleId) {
  try {
    const response = await CourseModule.updateOne(
      {
        _id: moduleId,
      },
      { $set: { completed: true } },
    );
    return response.acknowledged;
  } catch (error) {
    console.log("error:", error.message);
  }
};
schema.statics.checkForModuleCompletion = async function (moduleId) {
  try {
    const response = await Lesson.find({
      module: moduleId,
    });
    const completed = response.reduce(
      (acc, document) => acc && document.completed === true,
      true,
    );
    return completed;
  } catch (error) {
    console.log("error:", error.message);
  }
};
const CourseModule = mongoose.model("CourseModule", schema);

module.exports = CourseModule;
