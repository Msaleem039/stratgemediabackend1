import express from "express";
import { deleteUser, forgotPassword, getAllUsers, getUserDetails, loginUser, registerUser, resetPassword, updateProfile } from "../controller/user.js";
import { protect } from "../middleware/authMiddleware.js";
import { submitContactForm } from "../middleware/auth.js";

const routes = express.Router();

routes.route("/register").post(registerUser)
routes.route("/login").post(loginUser)
routes.post('/forgot-password', forgotPassword);
routes.post('/reset-password', resetPassword);
routes.post('/reset-password/:token', resetPassword);
routes.delete('/:id', protect, deleteUser);
routes.get('/users/all',getAllUsers);
routes.get('/me', protect, getUserDetails);
routes.put('/users/update/:id', protect, updateProfile);
routes.delete('/users/:id', protect, deleteUser);
routes.post('/submit', submitContactForm);
export default routes