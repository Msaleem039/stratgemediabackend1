import mongoose from "mongoose";
import { asyncHandler } from "../utlils/globalutils.js";

 export const DBconnection = asyncHandler(async()=>{
    await mongoose.connect("mongodb+srv://saher79129:6UoV2xjvDLI13Uu3@cluster0.ydtyimm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    console.log("db connection successfully")
})