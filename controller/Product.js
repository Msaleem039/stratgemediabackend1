import Product from "../model/product.js";
import cloudinary from "../utlils/cloudinary.js";
import { asyncHandler } from "../utlils/globalutils.js";

import pkg from 'validator';
const { isURL } = pkg;

export const createProduct = async (req, res) => {
  try {
    const { title, image, category, videoUrl } = req.body;

    // Validate required fields
    if (!title || !category || !videoUrl) {
      return res.status(400).json({ 
        message: "Title, category, and videoUrl are required fields" 
      });
    }

    let finalImageUrl = "";

    // ✅ Handle image (URL, base64, or file upload)
    if (image) {
      // Check if it's a valid URL (external image link)
      if (isURL(image)) {
        finalImageUrl = image;
      }
      // Else upload to Cloudinary (base64 or file)
      else {
        let uploadOptions = {
          folder: "products",
        };

        // If it's a base64 string, add the data URI prefix
        if (image.startsWith('data:')) {
          uploadOptions.resource_type = 'auto';
        }

        const cloudinaryResponse = await cloudinary.uploader.upload(image, uploadOptions);
        finalImageUrl = cloudinaryResponse.secure_url;
      }
    } else {
      // If no image provided, return error since image is required in model
      return res.status(400).json({ 
        message: "Image is required" 
      });
    }

    const product = await Product.create({
      title,
      videoUrl,
      image: finalImageUrl,
      category,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error in createProduct controller", error);
    res.status(500).json({ 
      message: "Server error", 
      error: error.message || "Unknown error occurred" 
    });
  }
};

// export const createProduct = async (req, res) => {    
// 	try {
// 		const {title, image, category,videoUrl } = req.body;

// 		let cloudinaryResponse = null;

// 		if (image) {
// 			cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
// 		}

// 		const product = await Product.create({
			
// 			title,
// 			videoUrl,
// 			image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
// 			category,
// 		});

// 		res.status(201).json(product);
// 	} catch (error) {
// 		console.log("Error in createProduct controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };

 export const getAllProduct = asyncHandler(async(req,res)=>{
    const product = await Product.find();
    res.status(201).json({
        message:"product fetch successfully",
        product
    })
 })

 export const getsingleproduct =async(req,res)=>{
const { id } = req.params;

 try {
 const product =  await Product.findById(id)
 res.status(201).json({
	product,
	message:"product fetch successfully"
 })
 } catch (error) {
	res.status(401).json({
		error,
		message:"error while fetching product"
	})
 }
 }

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, image, category, videoUrl } = req.body;

        // Find the product first
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        let cloudinaryResponse = null;
        let imageUrl = product.image; // Keep existing image by default

        // Handle new image upload if provided
        if (image && image !== product.image) {
            // Delete old image from cloudinary if it exists
            if (product.image && product.image.includes('cloudinary')) {
                const publicId = product.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            }

            // Upload new image
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
            imageUrl = cloudinaryResponse.secure_url;
        }

        // Update the product
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                title: title || product.title,
                image: imageUrl,
                category: category || product.category,
                videoUrl: videoUrl || product.videoUrl,
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.log("Error in updateProduct controller", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the product first
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Delete image from cloudinary if it exists
        if (product.image && product.image.includes('cloudinary')) {
            const publicId = product.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(publicId);
        }

        // Delete the product from database
        await Product.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.log("Error in deleteProduct controller", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};