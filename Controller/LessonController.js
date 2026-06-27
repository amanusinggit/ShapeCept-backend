const CourseModule = require("../Model/CourseModule");
const LessonModel = require("../Model/Lesson");
const Course = require("../Model/Course");

const getLesson = async (req, res) => {
  const lessonId = req.params.lessonId;
  try {
    const lesson = await LessonModel.getLesson(lessonId);
    res.status(200).json(lesson);
  } catch (error) {
    console.log(error.message);
  }
};
const getLessons = async (req, res) => {
  const moduleId = req.params.moduleId;
  try {
    const lessons = await LessonModel.getLessonsForModule(moduleId);
    res.status(200).json(lessons);
  } catch (error) {
    console.log(error.message);
  }
};

const markLessonComplete = async (req, res) => {
  const moduleId = req.params.moduleId;
  const courseId = req.params.courseId;
  const lessonId = req.params.lessonId;
  console.log(moduleId, courseId, lessonId);
  try {
    const updateResponse = await LessonModel.markAsCompleted(lessonId);
    await Course.updateProgress(courseId);
    console.log("here");
    if (updateResponse === true) {
      //get all lesson and check if every one of them is completed
      const completed = await CourseModule.checkForModuleCompletion(moduleId);
      if (completed) {
        await CourseModule.markAsCompleted(moduleId);
        //get all the modules for the course and check if every one of them is completed
        // const completed = await Course.checkForCourseCompletion(courseId);
      }
    } else {
      throw new Error("Cannot mark the lesson as complete");
    }
    res.send(200).json({ message: "Lesson Marked Completed" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
module.exports = { getLesson, getLessons, markLessonComplete };
