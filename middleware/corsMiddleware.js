import cors from 'cors';
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      // 'https://app.strategemmedia.com',
      // 'https://api.strategemmedia.com',
      'https://fsroyaldesertsafaridubai.com',
      'https://api.fsroyaldesertsafaridubai.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    // Allow requests with no origin (like mobile apps, Postman, curl, etc.)
    if (!origin) {
      console.log('CORS Origin: undefined (allowed for API tools)');
      return callback(null, true);
    }
    
    console.log('CORS Origin:', origin);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS Error: Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
};

export default cors(corsOptions);
