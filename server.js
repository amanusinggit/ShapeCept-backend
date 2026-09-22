const express = require("express");
require("dotenv").config();
var cors = require("cors");
const { auth } = require("express-oauth2-jwt-bearer");
const { jwtCheck } = require("./Middleware/tokenValidation");
const userRoutes = require("./Routes/UserRoutes");
const courseRoutes = require("./Routes/CourseRoutes");
const moduleRoutes = require("./Routes/ModuleRoutes");
const lessonRoutes = require("./Routes/LessonRoutes");
const connectToDatabase = require("./Config/db");
const generateLessons = require("./Services/generateLessons");
const generateCourse = require("./Services/generateCourse");
const generateLesson = require("./Services/generateLesson");
const Lesson = require("./Model/Lesson");
const CourseModule = require("./Model/CourseModule");
const Course = require("./Model/Course");
const User = require("./Model/User");
const { EMAIL } = require("./constants");
const { google } = require("googleapis");
const getVideoUrlFromYoutube = require("./Services/youtubeSearch");
const generateAudio = require("./Services/generateAudio");
const { default: mongoose } = require("mongoose");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use("/", userRoutes);
app.use("/", courseRoutes);
app.use("/", moduleRoutes);
app.use("/", lessonRoutes);
connectToDatabase();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/private", jwtCheck, (req, res) => {
  console.log(req.auth.payload["https://api.shapecept.com/email"]);
  res.json({
    message: "Hello from a scoped endpoint! You have the required permission.",
    user: req.auth.payload.sub,
    authPayload: req.auth,
    payload: req.auth.payload,
    scope: req.auth.payload.scope,
    timestamp: new Date().toISOString(),
  });
});

app.post("/generateCourse", jwtCheck, async (req, res) => {
  const email = req.body.auth.payload[EMAIL];
  // const email = req.body.auth.payload.email;
  console.log("email", email);
  const userId = await User.getUserId(email);
  const { prompt } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const course = await generateCourse(prompt);
    const { modules, ...updatedCourse } = course;
    const courseWithUser = {
      ...updatedCourse,
      user: userId,
      progress: 0,
      lessonCount: 0,
    };
    const courseId = await Course.addCourse(courseWithUser, session);
    console.log("coursecreated");
    const promises = modules.map(async (module) => {
      //save the module and get the id
      const updatedModule = { ...module, course: courseId };
      const moduleId = await CourseModule.addModule(updatedModule, session);
      console.log("modulecreated");
      const lessons = await generateLessons(course.title, module.title);
      // console.log("lessons", lessons);
      const promises = lessons.lessonsObject.map(
        async ({ lessonTitle, lessonConclusion }) => {
          const lesson = await generateLesson(lessonTitle);
          // console.log("lesson", lesson.lesson);
          const promises = lesson.lesson.map(async (lessonUnit) => {
            if (lessonUnit.type === "video") {
              const url = await getVideoUrlFromYoutube(lessonUnit.title);
              lessonUnit.url = url;
            }
          });
          await Promise.all(promises);
          const updatedLesson = {
            title: lessonTitle,
            conclusion: lessonConclusion,
            content: lesson.lesson,
            module: moduleId,
          };

          await Lesson.addLesson(updatedLesson, session);
          console.log("lessoncreated");
        },
      );
      await Promise.all(promises);
    });
    await Promise.all(promises);
    // // fetching and assembling the course
    // const generatedCourse = await Course.getCoursesForUser(userId);
    // console.log("generatedCourse", generatedCourse);
    // const firstGeneratedCourse = generatedCourse[0];
    // console.log("firstgeneratedCOurse", firstGeneratedCourse);
    // const generatedCourseModules = await CourseModule.getModulesForCourse(
    //   firstGeneratedCourse._id,
    // );
    // console.log(generatedCourseModules);
    // const generatedCourseModulesWithLessonsPromises =
    //   generatedCourseModules.map(async (courseModule) => {
    //     const generatedLessons = await Lesson.getLessonsForModule(
    //       courseModule._id,
    //     );
    //     courseModule.lessons = generatedLessons;
    //     return courseModule;
    //   });
    // const generatedCourseModulesWithLessons = await Promise.all(
    //   generatedCourseModulesWithLessonsPromises,
    // );
    // const completeCourse = {
    //   course: { ...firstGeneratedCourse, ...generatedCourseModulesWithLessons },
    // };
    // console.log(completeCourse);
    await session.commitTransaction();
    res.status(200).json({ message: "Course created successfully." });
  } catch (error) {
    session.abortTransaction();
    console.log(error.message);
    res.json({
      message: "It's not you, it's us. Please Try Again.",
    });
  }
  await session.endSession();
});

app.post("/audio", async (req, res) => {
  const { text } = req.body;
  try {
    // const filePath = path.join("C:\\Users\\singh\\Downloads\\response.wav");
    const response = await generateAudio(text);
    res.setHeader("Content-Type", "audio/wav");
    // fs.createReadStream(filePath).pipe(res);
    res.send(response);
  } catch (error) {
    res.status(500).json({
      message:
        "Sorry, Please Try Again Later. It looks like the API limit has reached",
    });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("Server Listening at port 3000.");
});
