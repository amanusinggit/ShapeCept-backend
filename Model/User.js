const mongoose = require("mongoose");
const validator = require("validator");

const schema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    validate: { validator: validator.isEmail, message: "Not a valid email." },
  },
});

schema.statics.getUserId = async function (email) {
  const user = await User.findOne({ email: email });
  return user._id;
};

const User = mongoose.model("User", schema);

module.exports = User;
