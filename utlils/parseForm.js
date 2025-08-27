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

      // Flatten single-value fields (since v3 returns arrays always)
      Object.keys(fields).forEach((key) => {
        if (Array.isArray(fields[key]) && fields[key].length === 1) {
          fields[key] = fields[key][0];
        }
      });

      req.fields = fields;
      req.files = files;
      next();
    });
  } else {
    next(); // Let express.json() handle it
  }
};
