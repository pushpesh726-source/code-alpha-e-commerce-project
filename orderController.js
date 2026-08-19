const Order = require('../models/Order');
const User = require('../models/User');

const getDemoUserById = (userId) => (global.__demoStore?.users || []).find((user) => user._id === userId);

const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'Card' } = req.body;

    if (global.__demoMode) {
      const user = getDemoUserById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (!user.cart || user.cart.length === 0) {
        return res.status(400).json({ message: 'Your cart is empty' });
      }

      const items = user.cart.map((entry) => {
        const product = (global.__demoStore.products || []).find((item) => item._id === entry.product || item.id === entry.product);
        return {
          product: entry.product,
          name: product ? product.name : 'Product',
          image: product ? product.image : '',
          quantity: entry.quantity,
          price: product ? product.price : 0
        };
      });

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const total = subtotal;
      const order = {
        _id: `order-${Date.now()}`,
        user: user._id,
        items,
        shippingAddress,
        paymentMethod,
        subtotal,
        total,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      global.__demoStore.orders.push(order);
      user.cart = [];

      return res.status(201).json({ message: 'Order placed successfully', order });
    }

    const user = await User.findById(req.user._id).populate('cart.product');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    const items = user.cart.map((entry) => ({
      product: entry.product._id,
      name: entry.product.name,
      image: entry.product.image,
      quantity: entry.quantity,
      price: entry.product.price
    }));

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal;

    const order = await Order.create({
      user: user._id,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      total,
      status: 'pending'
    });

    user.cart = [];
    await user.save();

    return res.status(201).json({
      message: 'Order placed successfully',
      order
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not create order' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    if (global.__demoMode) {
      const orders = (global.__demoStore?.orders || []).filter((order) => order.user === req.user._id);
      return res.json(orders);
    }

    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not fetch orders' });
  }
};

module.exports = { createOrder, getUserOrders };
