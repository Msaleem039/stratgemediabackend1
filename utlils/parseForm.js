// import formidable from 'formidable';

// // Custom middleware to conditionally parse only if it's multipart
// const conditionalParseForm = (req, res, next) => {
//   const contentType = req.headers['content-type'] || '';
//   if (contentType.includes('multipart/form-data')) {
//     const form = formidable({ multiples: true });
//     form.parse(req, (err, fields, files) => {
//       if (err) return next(err);
//       req.fields = fields;
//       req.files = files;
//       next();
//     });
//   } else {
//     next(); // Let express.json() handle it
//   }
// };

// export default conditionalParseForm;
