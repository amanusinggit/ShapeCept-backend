const {
  getLesson,
  getLessons,
  markLessonComplete,
} = require("../Controller/LessonController");
const { jwtCheck } = require("../Middleware/tokenValidation");

const router = require("express").Router();

router.get("/getLessons/:moduleId", jwtCheck, getLessons);
router.get("/getLesson/:lessonId", jwtCheck, getLesson);
router.patch(
  "/markComplete/course/:courseId/module/:moduleId/lesson/:lessonId",
  jwtCheck,
  markLessonComplete,
);

module.exports = router;
