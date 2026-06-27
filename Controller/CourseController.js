const { default: mongoose } = require("mongoose");
const { EMAIL } = require("../constants");
const courseModel = require("../Model/Course");
const CourseModule = require("../Model/CourseModule");
const Lesson = require("../Model/Lesson");
const userModel = require("../Model/User");

const getCourses = async (req, res) => {
  const email = req.auth.payload[EMAIL];
  try {
    const userId = await userModel.getUserId(email);
    const courses = await courseModel.getCoursesForUser(userId);
    res.status(200).json(courses);
  } catch (error) {
    console.log(error.message);
  }
};
const getCourse = async (req, res) => {
  const courseId = req.params.courseId;
  try {
    const course = await courseModel.getCourse(courseId);
    res.status(200).json(course);
  } catch (error) {
    console.log(error.message);
  }
};

const removeCourse = async (req, res) => {
  const courseId = req.params.courseId;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const modules = await CourseModule.find({ course: courseId }).session(
      session,
    );
    //delete lessons
    const promises = modules.map(async (module) => {
      const lessons = await Lesson.find({ module: module._id }).session(
        session,
      );
      const promises = lessons.map(
        async (lesson) =>
          await Lesson.deleteOne({ _id: lesson._id }).session(session),
      );
      await Promise.all(promises);
      await CourseModule.deleteOne({ _id: module._id }).session(session);
    });
    await Promise.all(promises);
    console.log(courseId);
    const result = await courseModel
      .deleteOne({
        _id: new mongoose.Types.ObjectId(courseId),
      })
      .session(session);
    console.log(result);
    await session.commitTransaction();
    res
      .status(200)
      .json({ text: "Course successfully deleted.", success: true });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (error) {
      res.status(500).json({ text: error.message, success: false });
      return;
    }
    console.log(error.message);
    res.status(500).json({ text: error.message, success: false });
  }
  session.endSession();
};

module.exports = { getCourses, getCourse, removeCourse };
