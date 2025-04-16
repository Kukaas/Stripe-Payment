# Stripe Payment Integration System

A full-stack application demonstrating Stripe subscription management with React and Node.js.

## Prerequisites

- Node.js (v16 or higher)
- MySQL
- Stripe Account
- Gmail Account (for email notifications)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Kukaas/Stripe-Payment.git
cd Stripe-Payment
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

Configure your `.env` file with:
- Database credentials
- Stripe API keys
- Gmail credentials
- JWT secret

### 3. Database Setup

```bash
# Create your MySQL database
mysql -u root -p
CREATE DATABASE your_database_name;

# Run migrations
npm run migrate:fresh
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

Configure your frontend `.env` file with:
- API URL
- Stripe price IDs

### 5. Start the Application

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Stripe Configuration

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Create three price products in Stripe:
   - Basic Plan
   - Premium Plan
   - Advanced Plan
4. Add the price IDs to your frontend `.env` file
5. Set up Stripe webhook for local development:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

## Environment Variables

### Backend (.env)
```
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
JWT_SECRET=your_secret_key

EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_specific_password

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=your_database_name

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PRICE_ID_BASIC=price_...
VITE_STRIPE_PRICE_ID_PREMIUM=price_...
VITE_STRIPE_PRICE_ID_ADVANCED=price_...
```
```
