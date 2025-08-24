import Product from "../model/product.js";
import cloudinary from "../utlils/cloudinary.js";
import { asyncHandler } from "../utlils/globalutils.js";

import pkg from 'validator';
const { isURL } = pkg;


export const createProduct = asyncHandler(async (req, res) => {
  try {
    // Handle both JSON and form-data
    let title, category, videoUrl, image;
    let imageFile, videoFile;

    // Check if it's form-data (file upload) or JSON
    if (req.fields) {
      // Form-data
      title = Array.isArray(req.fields.title) ? req.fields.title[0] : req.fields.title;
      category = Array.isArray(req.fields.category) ? req.fields.category[0] : req.fields.category;
      videoUrl = Array.isArray(req.fields.videoUrl) ? req.fields.videoUrl[0] : req.fields.videoUrl;
      image = Array.isArray(req.fields.image) ? req.fields.image[0] : req.fields.image;
      imageFile = req.files?.image;
      videoFile = req.files?.videoFile;
    } else {
      // JSON data
      title = req.body.title;
      category = req.body.category;
      videoUrl = req.body.videoUrl;
      image = req.body.image;
    }

   

    if (!title || !category) {
      return res.status(400).json({ message: "Title and category are required" });
    }

    let finalImageUrl = "";
    let finalVideoUrl = "";

    // Handle image (Cloudinary upload or external URL)
    if (image && isURL(image)) {
      // If image is provided as URL
      finalImageUrl = image;
    } else if (imageFile) {
      // If image is uploaded as file
      const imageUpload = await cloudinary.uploader.upload(imageFile[0].filepath, {
        folder: "products",
        resource_type: "auto",
      });
      finalImageUrl = imageUpload.secure_url;
    } else {
      return res.status(400).json({ message: "Image is required" });
    }

    // Handle video (external URL or uploaded file)
    if (videoUrl) {
      if (isURL(videoUrl)) {
        finalVideoUrl = videoUrl;
      } else {
        return res.status(400).json({ message: "Invalid video URL format" });
      }
    } else if (videoFile) {
      const videoUpload = await cloudinary.uploader.upload(videoFile[0].filepath, {
        folder: "products/videos",
        resource_type: "video",
      });
      finalVideoUrl = videoUpload.secure_url;
    }

    const product = await Product.create({
      title,
      category,
      image: finalImageUrl,
      videoUrl: finalVideoUrl || null,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



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

export const updateProduct = asyncHandler (async(req, res) => {
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
});

export const deleteProduct = asyncHandler (async(req, res) => {
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
});