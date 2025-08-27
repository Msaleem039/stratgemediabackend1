import Product from "../model/product.js";
import cloudinary from "../utlils/cloudinary.js";
import { asyncHandler } from "../utlils/globalutils.js";

import pkg from 'validator';
const { isURL } = pkg;


export const createProduct = asyncHandler(async (req, res) => {
  try {
    // Normalize incoming fields (formidable v3 always gives arrays)
    const normalizeFields = (obj = {}) => {
      const out = {};
      for (const [key, value] of Object.entries(obj)) {
        out[key] = Array.isArray(value) ? value[0] : value;
      }
      return out;
    };

    const fields = req.fields ? normalizeFields(req.fields) : normalizeFields(req.body);
    const files = req.files || {};

    const { title, category, videoUrl, image } = fields;
    const imageFile = files.image?.[0];
    const videoFile = files.videoFile?.[0];

    // Debug log
    console.log("=== DEBUG INFO ===");
    console.log("Fields:", fields);
    console.log("Files:", Object.keys(files));
    console.log("==================");

    // Validate required fields
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!category) return res.status(400).json({ message: "Category is required" });

    let finalImageUrl = "";
    let finalVideoUrl = "";

    // ---- Handle image ----
    if (image && isURL(image)) {
      finalImageUrl = image; // URL provided
    } else if (imageFile) {
      const upload = await cloudinary.uploader.upload(imageFile.filepath, {
        folder: "products",
        resource_type: "auto",
      });
      finalImageUrl = upload.secure_url;
    } else {
      return res.status(400).json({ message: "Image is required (URL or file)" });
    }

    // ---- Handle video ----
    if (videoUrl) {
      if (!isURL(videoUrl)) {
        return res.status(400).json({ message: "Invalid video URL format" });
      }
      finalVideoUrl = videoUrl;
    } else if (videoFile) {
      const upload = await cloudinary.uploader.upload(videoFile.filepath, {
        folder: "products/videos",
        resource_type: "video",
      });
      finalVideoUrl = upload.secure_url;
    }

    // ---- Save to DB ----
    const product = await Product.create({
      title,
      category,
      image: finalImageUrl,
      videoUrl: finalVideoUrl || null,
    });

    console.log("✅ Product created:", product._id);

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Error in createProduct:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



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