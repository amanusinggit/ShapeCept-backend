const user = require("../Model/User.js");

const createUser = async (req, res) => {
  try {
    const name = req.auth.payload["https://api.shapecept.com/name"];
    const email = req.auth.payload["https://api.shapecept.com/email"];
    console.log(email);
    const userData = await user.find({ email: email });
    console.log("userData", userData);
    if (userData.length === 0) {
      const newUser = new user({ name: name, email: email });
      await newUser.save();
      res.status(200).json({ message: "user successfully created." });
    } else {
      res.status(200).json({ message: "user already exists." });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

const readUser = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) throw new Error("You did not send any email.");
    const userData = await user.find({ email: req.email });
    if (!userData) {
      res.status(200).send(userData);
    }
  } catch (error) {
    res
      .status(400)
      .json({ message: "Cannot find user with the email " + email });
  }
};

module.exports = { createUser, readUser };
