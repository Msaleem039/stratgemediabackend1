import cors from 'cors';
const corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://app.strategemmedia.com',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Authorization, Content-Type, X-Requested-With',
  optionsSuccessStatus: 204,
};

const corsMiddleware = cors(corsOptions);
export default corsMiddleware; 