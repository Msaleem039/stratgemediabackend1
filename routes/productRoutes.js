import express from 'express';
import {createProduct, deleteProduct, getAllProduct, getsingleproduct, updateProduct } from '../controller/Product.js';

const routes = express.Router();
routes.route("/product").post(createProduct)
routes.route("/all").get(getAllProduct)
routes.route("/singleproduct/:id").get(getsingleproduct)
routes.put('/update/:id', updateProduct);
routes.delete('/delete/:id', deleteProduct);
export default routes