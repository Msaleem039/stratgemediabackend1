import formidable from "formidable";

export const conditionalParseForm = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    const form = formidable({
      multiples: true,       // allow multiple files
      keepExtensions: true,  // preserve .jpg, .mp4 etc.
    });

    form.parse(req, (err, fields, files) => {
      if (err) return next(err);

      // ✅ Don't flatten here, just pass raw data
      req.fields = fields;  // might still be arrays → handled later
      req.files = files;    // file objects
      next();
    });
  } else {
    next(); // Let express.json() handle normal JSON bodies
  }
};
