import express from 'express'
import { DBconnection } from './config/DBconnection.js'
import routes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import dotenv from "dotenv";
dotenv.config();
import corsMiddleware from './middleware/corsMiddleware.js'

// Check for required environment variables
if (!"erqdgkdsyrewit43252fgdskhfyrwehfdjkljytrigbgfgrw") {
  console.error('FATAL ERROR: JWT_SECRET is not defined.');
  process.exit(1);
}

const app = express()
const port = 5000
app.use(corsMiddleware);
app.use(express.json());
app.use(express.json({ limit: "10mb" }));  
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use("/api", routes)
app.use("/api", productRoutes)
app.use("/api",paymentRoutes)
DBconnection();
// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  }); // Force IPv4

// })
