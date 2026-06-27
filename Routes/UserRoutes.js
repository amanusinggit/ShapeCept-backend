const router = require("express").Router();
const { createUser, readUser } = require("../Controller/UserController");
const { jwtCheck } = require("../Middleware/tokenValidation");

router.get("/addUser", jwtCheck, createUser);
router.post("/getUser", jwtCheck, readUser);

module.exports = router;
