const mongoose = require("mongoose");

const connectDB = async () => {
  const dbURI = process.env.MONGODB_URI;

  try {
    await mongoose.connect(dbURI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
