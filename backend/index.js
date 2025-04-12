import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Routes
import stripeRoutes from './routes/stripe.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/stripe', stripeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});