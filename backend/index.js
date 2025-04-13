import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import stripeRoutes from './routes/stripe.routes.js';
import userRoutes from './routes/user.route.js';

import promisePool from './config/db.config.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Origin", "stripe-signature"],
  })
)

app.use(cookieParser());

app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    let rawBody = '';
    req.on('data', (chunk) => {
      rawBody += chunk.toString();
    });
    req.on('end', () => {
      req.rawBody = rawBody;
      next();
    });
  } else {
    next();
  }
});

app.use((req, res, next) => {
  if(req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json()(req, res, next);
  }
})

app.use(express.urlencoded({ extended: true }));

app.use('/api/stripe', stripeRoutes);
app.use('/api/auth', userRoutes)


const initializeApp = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Connected to the database!');
    connection.release();

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
    
  } catch (error) {
    console.error('Error connecting to the database:', error);
    process.exit(1); // Exit the process with failure
  }
}

initializeApp();

export default app;
 