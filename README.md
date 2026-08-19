# CodeAlpha Full Stack E-commerce Store

A complete full-stack e-commerce website built with Node.js, Express, MongoDB, Mongoose, and a responsive vanilla JavaScript frontend.

## Features

- Responsive storefront UI
- Product listing with categories and search
- Product details modal/page
- Cart management with quantity updates and total calculation
- User registration and login with JWT
- Protected order checkout
- Order history for authenticated users
- MongoDB persistence using Mongoose
- Sample product data loaded automatically

## Tech Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose
- Authentication: JWT + bcryptjs
- Environment configuration: dotenv

## Project Structure

- frontend/ - storefront client assets
- backend/ - backend config and server helpers
- controllers/ - request logic
- models/ - MongoDB models
- routes/ - API routes
- middleware/ - auth middleware
- public/ - static/public assets
- server.js - Express server entry point
- package.json - project scripts and dependencies

## Prerequisites

- Node.js 18+
- npm
- MongoDB Atlas connection OR local MongoDB server (optional because the app can start using an in-memory MongoDB fallback when MONGODB_URI is not provided)

## Installation

1. Open a terminal in the project root.
2. Install dependencies:

   npm install

3. Copy the environment file:

   copy .env.example .env

4. Update your values in `.env` if you want to use a real MongoDB database.

## Run the project

### Development mode

npm run dev

### Production mode

npm start

The app will run on:

- http://localhost:5000

## API endpoints

### Authentication

- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Products

- GET /api/products
- GET /api/products/:id

### Cart

- GET /api/cart
- POST /api/cart
- PUT /api/cart/:productId
- DELETE /api/cart/:productId

### Orders

- GET /api/orders
- POST /api/orders

## Sample login

A default demo account is created automatically when the app starts if no users exist.

Email: demo@store.com
Password: demo123

## Notes

- If no MongoDB connection string is supplied, the app automatically starts a temporary MongoDB memory instance for local development.
- For a real deployment, set a secure JWT secret and a valid MongoDB URI in your `.env` file.
