import Product from "../model/product.js";
import cloudinary from "../utlils/cloudinary.js";
import { asyncHandler } from "../utlils/globalutils.js";

import pkg from 'validator';
const { isURL } = pkg;


// export const createProduct = asyncHandler(async (req, res) => {
//   try {
//     /**
//      * Helper: Normalize Formidable fields
//      * Formidable v3 always returns arrays, even for single values.
//      * Example: { title: ["My Title"] } → becomes { title: "My Title" }
//      */
//     const normalizeFields = (obj = {}) => {
//       const out = {};
//       for (const [key, value] of Object.entries(obj)) {
//         out[key] = Array.isArray(value) ? value[0] : value;
//       }
//       return out;
//     };

//     // Normalize fields (from formidable if multipart, otherwise req.body)
//     const fields = req.fields ? normalizeFields(req.fields) : normalizeFields(req.body);
//     const files = req.files || {};

//     // Extract values
//     const { title, category, videoUrl, imageUrl } = fields;
//     const imageFile = files.imageFile?.[0];
//     const videoFile = files.videoFile?.[0];

//     // ---------------- DEBUG LOGGING ----------------
//     console.log("====== [createProduct] Incoming Request ======");
//     console.log("Fields (normalized):", fields);
//     console.log("Files (keys):", Object.keys(files));
//     if (imageFile) console.log("Image file detected:", imageFile.originalFilename);
//     if (videoFile) console.log("Video file detected:", videoFile.originalFilename);
//     console.log("=============================================");

//     // ---------------- VALIDATIONS ----------------
//     if (!title) {
//       console.warn("[createProduct] Missing title");
//       return res.status(400).json({ message: "Title is required" });
//     }
//     if (!category) {
//       console.warn("[createProduct] Missing category");
//       return res.status(400).json({ message: "Category is required" });
//     }

//     let finalImageUrl = "";
//     let finalVideoUrl = "";

//     // ---------------- HANDLE IMAGE ----------------
//     if (imageUrl && isURL(imageUrl)) {
//       console.log("[Image] Using provided URL:", imageUrl);
//       finalImageUrl = imageUrl;
//     } else if (imageFile) {
//       console.log("[Image] Uploading image file to Cloudinary...");
//       const upload = await cloudinary.uploader.upload(imageFile.filepath, {
//         folder: "products",
//         resource_type: "auto",
//       });
//       finalImageUrl = upload.secure_url;
//       console.log("[Image] File uploaded successfully:", finalImageUrl);
//     } else {
//       console.warn("[Image] No image provided");
//       return res.status(400).json({ message: "Image is required (URL or file)" });
//     }

//     // ---------------- HANDLE VIDEO ----------------
//     if (videoUrl) {
//       if (!isURL(videoUrl)) {
//         console.warn("[Video] Invalid video URL:", videoUrl);
//         return res.status(400).json({ message: "Invalid video URL format" });
//       }
//       console.log("[Video] Using provided URL:", videoUrl);
//       finalVideoUrl = videoUrl;
//     } else if (videoFile) {
//       console.log("[Video] Uploading video file to Cloudinary...");
//       const upload = await cloudinary.uploader.upload(videoFile.filepath, {
//         folder: "products/videos",
//         resource_type: "video",
//       });
//       finalVideoUrl = upload.secure_url;
//       console.log("[Video] File uploaded successfully:", finalVideoUrl);
//     } else {
//       console.log("[Video] No video provided (optional)");
//     }

//     // ---------------- SAVE TO DATABASE ----------------
//     const product = await Product.create({
//       title,
//       category,
//       image: finalImageUrl,
//       videoUrl: finalVideoUrl || null,
//     });

//     console.log("✅ [createProduct] Product created:", product._id);

//     // ---------------- RESPONSE ----------------
//     res.status(201).json(product);

//   } catch (error) {
//     console.error("❌ [createProduct] Server error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// });

export const createProduct = async (req, res) => {
  try {
    const fields = req.fields || {};
    const files = req.files || {};

    console.log("Endpoint received fields:", fields);
    console.log("Endpoint received files:", files);

    // Helper: flatten fields (except inclusions[])
    const flattenField = (value) => {
      if (Array.isArray(value)) return value[0] || "";
      return value || "";
    };

    // Extract flattened fields
    const title = flattenField(fields.title);
    const type = flattenField(fields.type);
    const price = flattenField(fields.price);
    const button = flattenField(fields.button) || "BOOK NOW";
    const imageUrl = flattenField(fields.imageUrl);

    // Handle inclusions
    let inclusionsArray = [];
    if (fields["inclusions[]"]) {
      inclusionsArray = Array.isArray(fields["inclusions[]"])
        ? fields["inclusions[]"].map((i) => i.toString().trim())
        : [fields["inclusions[]"].toString().trim()];
    } else if (fields.inclusions) {
      inclusionsArray = Array.isArray(fields.inclusions)
        ? fields.inclusions.map((i) => i.toString().trim())
        : fields.inclusions.split(",").map((i) => i.trim());
    }

    // Validate required
    if (!title || !type || !price) {
      return res.status(400).json({
        success: false,
        message: "Title, type, and price are required",
      });
    }

    // Handle image (file > URL > empty)
    let finalImageUrl = "";
    if (files.image) {
      console.log("Image file detected, uploading...");
      try {
        const filePath = files.image.filepath || files.image.path;
        if (!filePath) {
          return res.status(400).json({
            success: false,
            message: "Invalid file upload",
          });
        }

        const upload = await cloudinary.uploader.upload(filePath, {
          folder: "products",
          resource_type: "auto",
        });

        finalImageUrl = upload.secure_url;
        console.log("File uploaded successfully:", finalImageUrl);
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
          error: err.message,
        });
      }
    } else if (imageUrl) {
      finalImageUrl = imageUrl;
      console.log("Using provided imageUrl:", imageUrl);
    } else {
      console.log("No image provided, leaving empty");
    }

    // Create product
    const product = await Product.create({
      title: title.trim(),
      type: type.trim(),
      price: price.trim(),
      button: button.trim(),
      image: finalImageUrl,
      inclusions: inclusionsArray,
    });

    console.log("Product created successfully:", product._id);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error in createProduct endpoint:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


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