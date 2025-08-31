// import formidable from "formidable";

// export const conditionalParseForm = (req, res, next) => {
//   const contentType = req.headers['content-type'] || '';
//   if (contentType.includes('multipart/form-data')) {
//     const form = formidable({
//       multiples: true,       // allow multiple files
//       keepExtensions: true,  // preserve .jpg, .mp4 etc.
//     });

//     form.parse(req, (err, fields, files) => {
//       if (err) return next(err);

//       // ✅ Don't flatten here, just pass raw data
//       req.fields = fields;  // might still be arrays → handled later
//       req.files = files;    // file objects
//       next();
//     });
//   } else {
//     next(); // Let express.json() handle normal JSON bodies
//   }
// };
import formidable from 'formidable';



export const conditionalParseForm = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    const form = formidable({
      // multiples: true,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      uploadDir: './uploads', // optional
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Formidable error:", err);
        return res.status(400).json({ success: false, message: "Invalid form data" });
      }

      req.fields = fields || {};
      req.files = files || {};

      // Normalize single file array to object
      if (req.files.image && Array.isArray(req.files.image)) {
        req.files.image = req.files.image[0];
      }

      console.log("Middleware - Fields:", req.fields);
      console.log("Middleware - Files:", req.files);
      next();
    });
  } else {
    // For JSON requests
    req.fields = req.body || {};
    req.files = {};
    next();
  }
};