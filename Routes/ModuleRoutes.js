const router = require("express").Router();
const {
  getModule,
  getModules,
} = require("../Controller/CourseModuleController");
const { jwtCheck } = require("../Middleware/tokenValidation");

router.get("/getModules/:courseId", jwtCheck, getModules);
router.get("/getModule/:moduleId", jwtCheck, getModule);
module.exports = router;
