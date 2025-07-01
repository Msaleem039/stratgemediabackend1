import express from 'express'
import { DBconnection } from './config/DBconnection.js'
import routes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import dotenv from "dotenv";
dotenv.config();
import corsMiddleware from './middleware/corsMiddleware.js'
const app = express()
const port = 5000
app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));  // for JSON (e.g., Base64 image)
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json());
app.use("/api", routes)
app.use("/api", productRoutes)
app.use("/api",paymentRoutes)
DBconnection();
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
