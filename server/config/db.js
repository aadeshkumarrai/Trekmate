import mongoose from "mongoose";

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    throw new Error("MONGO_URI is missing from the .env file");
  }

  try {
    const connection = await mongoose.connect(mongoURI);

    console.log(
      `MongoDB connected successfully: ${connection.connection.host}`
    );
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;