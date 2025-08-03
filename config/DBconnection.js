import mongoose from "mongoose";

export const DBconnection = async () => {
  try {
    await mongoose.connect("mongodb+srv://saher79129:6UoV2xjvDLI13Uu3@cluster0.ydtyimm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("DB connection successful");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Stop server if DB fails
  }
};
