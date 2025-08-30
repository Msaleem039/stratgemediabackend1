import mongoose from "mongoose";

export const DBconnection = async () => {
  try {
    await mongoose.connect("mongodb+srv://fsroyaldesertsafaridubai:k7fswqMfiUN9q2Yd@cluster0.iqwlgiv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
    console.log("DB connection successful");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // Stop server if DB fails
  }
};
