import cors from 'cors';
const corsOptions = {
  origin: function (origin, callback) {
  const allowedOrigins = [
  'https://app.strategemmedia.com',
  'https://api.strategemmedia.com',
  'http://localhost:5000'
];
    console.log('CORS Origin:', origin); 
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
};

export default cors(corsOptions);
