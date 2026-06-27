const mongoose = require("mongoose");
const CourseModule = require("./CourseModule");
const Lesson = require("./Lesson");

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // modules: [{ type: mongoose.ObjectId, ref: "CourseModule" }],
  tags: [{ type: String }],
  user: { type: mongoose.ObjectId, ref: "User" },
  progress: { type: Number, min: 0, max: 100 },
  lessonCount: { type: Number },
  icon: { type: String },
  totalTimeRequired: { type: Number },
});

schema.statics.addCourse = async function (courseData, session) {
  try {
    const [newCourse] = await Course.create([courseData], { session });
    await newCourse.save({ session });
    return newCourse._id;
  } catch (error) {
    throw error;
  }
};
schema.statics.getCourse = async function (courseId) {
  try {
    const existingCourse = await Course.find({ _id: courseId });
    if (existingCourse.length === 0) {
      throw Error("No Existing Course");
    }
    return existingCourse;
  } catch (error) {
    console.log("error:", error.message);
  }
};
schema.statics.getCoursesForUser = async function (userId) {
  try {
    const existingCourses = await Course.find({ user: userId });
    return existingCourses;
  } catch (error) {
    console.log("error:", error.message);
  }
};

schema.statics.updateProgress = async function (courseId) {
  try {
    const courseModules = await CourseModule.find({ course: courseId });
    const courseModuleIds = courseModules.map(
      (courseModule) => courseModule._id,
    );
    const totalLessons = await Lesson.countDocuments({
      module: { $in: courseModuleIds },
    });
    const completedLessons = await Lesson.countDocuments({
      module: { $in: courseModuleIds },
      completed: true,
    });
    const updatedProgress = (completedLessons / totalLessons) * 100;
    const updateCourseResponse = await Course.updateOne(
      {
        _id: courseId,
      },
      { progress: updatedProgress },
    );
    return updateCourseResponse.acknowledged;
  } catch (error) {
    console.log("error:", error.message);
  }
};
const Course = mongoose.model("Course", schema);

module.exports = Course;
