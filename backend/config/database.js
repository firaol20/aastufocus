import mongoose from "mongoose";
import config from "./environment.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("MongoDB disconnected through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;