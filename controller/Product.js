import Product from "../model/product.js";
import cloudinary from "../utlils/cloudinary.js";
import { asyncHandler } from "../utlils/globalutils.js";

import pkg from 'validator';
const { isURL } = pkg;


export const createProduct = asyncHandler(async (req, res) => {
  try {
    /**
     * Helper: Normalize Formidable fields
     * Formidable v3 always returns arrays, even for single values.
     * Example: { title: ["My Title"] } → becomes { title: "My Title" }
     */
    const normalizeFields = (obj = {}) => {
      const out = {};
      for (const [key, value] of Object.entries(obj)) {
        out[key] = Array.isArray(value) ? value[0] : value; 
      }
      return out;
    };

    // Normalize fields coming from formidable (multipart) or body (JSON fallback)
    const fields = req.fields ? normalizeFields(req.fields) : normalizeFields(req.body);

    // Files (if any) uploaded by formidable
    const files = req.files || {};

    // Destructure expected fields
    const { title, category, videoUrl, imageUrl } = fields;

    // Extract file objects if they exist
    const imageFile = files.imageFile?.[0];   // uploaded image file
    const videoFile = files.videoFile?.[0];   // uploaded video file

    // Debug logging (helps in production troubleshooting)
    console.log("=== DEBUG INFO ===");
    console.log("Fields:", fields);                 // normalized text fields
    console.log("Files:", Object.keys(files));      // which files were uploaded
    console.log("==================");

    // ---------------- VALIDATIONS ----------------
    if (!title) return res.status(400).json({ message: "Title is required" });
    if (!category) return res.status(400).json({ message: "Category is required" });

    let finalImageUrl = "";
    let finalVideoUrl = "";

    // ---------------- HANDLE IMAGE ----------------
    if (imageUrl && isURL(imageUrl)) {
      // Case 1: User provided an image URL
      finalImageUrl = imageUrl;
    } else if (imageFile) {
      // Case 2: User uploaded an image file
      const upload = await cloudinary.uploader.upload(imageFile.filepath, {
        folder: "products",
        resource_type: "auto",
      });
      finalImageUrl = upload.secure_url;
    } else {
      return res.status(400).json({ message: "Image is required (URL or file)" });
    }

    // ---------------- HANDLE VIDEO ----------------
    if (videoUrl) {
      // Case 1: User provided a video URL
      if (!isURL(videoUrl)) {
        return res.status(400).json({ message: "Invalid video URL format" });
      }
      finalVideoUrl = videoUrl;
    } else if (videoFile) {
      // Case 2: User uploaded a video file
      const upload = await cloudinary.uploader.upload(videoFile.filepath, {
        folder: "products/videos",
        resource_type: "video",
      });
      finalVideoUrl = upload.secure_url;
    }
    // If neither provided, finalVideoUrl will remain empty/null

    // ---------------- SAVE TO DATABASE ----------------
    const product = await Product.create({
      title,
      category,
      image: finalImageUrl,
      videoUrl: finalVideoUrl || null,
    });

    console.log("✅ Product created:", product._id);

    // ---------------- RESPONSE ----------------
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