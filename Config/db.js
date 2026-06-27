const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://singhaman2016620_db_user:${process.env.DB_PASSWORD}@cluster0.nqac2xs.mongodb.net/?appName=Cluster0`,
    );
    console.log("connected to database");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = connectToDatabase;
