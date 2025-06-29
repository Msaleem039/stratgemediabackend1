import mongoose from "mongoose";
import { asyncHandler } from "../utlils/globalutils.js";

 export const DBconnection = asyncHandler(async()=>{
    await mongoose.connect(process.env.dbconnection)
    console.log("db connection successfully")
})