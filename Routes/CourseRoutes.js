const {
  getCourses,
  getCourse,
  removeCourse,
} = require("../Controller/CourseController");
const { jwtCheck } = require("../Middleware/tokenValidation");

const router = require("express").Router();

router.get("/getCourses", jwtCheck, getCourses);
router.get("/getCourse/:courseId", jwtCheck, getCourse);
router.delete("/removeCourse/:courseId", jwtCheck, removeCourse);

module.exports = router;
