import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import stripeRoutes from './routes/stripe.routes.js';
import userRoutes from './routes/user.route.js';

import promisePool from './config/db.config.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
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
 