const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: mongoose.Mixed, required: true },
  module: { type: mongoose.ObjectId, ref: "CourseModule" },
  conclusion: { type: String },
  completed: { type: Boolean },
});

schema.statics.addLesson = async function (lessonData, session) {
  try {
    const [newLesson] = await Lesson.create([lessonData], { session });
    await newLesson.save({ session });
    return newLesson._id;
  } catch (error) {
    throw error;
  }
};
schema.statics.getLesson = async function (lessonId) {
  try {
    const existingLesson = await Lesson.find({ _id: lessonId });
    if (existingLesson.length === 0) {
      throw Error("No Existing Lessons");
    }
    return existingLesson;
  } catch (error) {
    console.log("error:", error.message);
  }
};
schema.statics.getLessonsForModule = async function (moduleId) {
  try {
    const existingLessons = await Lesson.find({ module: moduleId });
    return existingLessons;
  } catch (error) {
    console.log("error:", error.message);
  }
};
schema.statics.markAsCompleted = async function (lessonId) {
  try {
    const response = await Lesson.updateOne(
      {
        _id: lessonId,
      },
      { $set: { completed: true } },
    );
    return response.acknowledged;
  } catch (error) {
    console.log("error:", error.message);
  }
};
const Lesson = mongoose.model("Lesson", schema);

module.exports = Lesson;
