require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');

const connectDB = require('./backend/config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const Product = require('./models/Product');
const sampleProducts = require('./scripts/sampleProducts');

global.__demoStore = {
  products: JSON.parse(JSON.stringify(sampleProducts)),
  users: [],
  orders: []
};

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

function startOnPort(port) {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(`Port ${port} is busy. Retrying on ${port + 1}...`);
      startOnPort(port + 1);
      return;
    }

    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'E-commerce API is running' });
});

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const startServer = async () => {
  try {
    const dbConnection = await connectDB();

    if (dbConnection && dbConnection.readyState === 1) {
      const productCount = await Product.countDocuments();
      if (productCount === 0) {
        await Product.insertMany(sampleProducts);
        console.log('Sample products seeded successfully');
      }
    } else {
      global.__demoStore.products = JSON.parse(JSON.stringify(sampleProducts));
      global.__demoStore.users = [
        {
          _id: 'demo-user-id',
          name: 'Demo User',
          email: 'demo@store.com',
          password: bcrypt.hashSync('demo123', 10),
          cart: []
        }
      ];
      console.log('Demo mode active: using in-memory product and user data');
    }

    startOnPort(DEFAULT_PORT);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
