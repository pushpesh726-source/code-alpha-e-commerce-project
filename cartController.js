const User = require('../models/User');

const getDemoUserById = (userId) => (global.__demoStore?.users || []).find((user) => user._id === userId);

const getCart = async (req, res) => {
  try {
    if (global.__demoMode) {
      const user = getDemoUserById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const cartItems = user.cart.map((item) => {
        const product = (global.__demoStore.products || []).find((entry) => entry._id === item.product || entry.id === item.product);
        return {
          product: product || { name: 'Product', price: 0, image: '', category: 'General' },
          quantity: item.quantity,
          subtotal: (product ? product.price : 0) * item.quantity
        };
      });

      const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
      return res.json({ cartItems, subtotal, total: subtotal });
    }

    const user = await User.findById(req.user._id).populate('cart.product');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartItems = user.cart.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity
    }));

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    return res.json({ cartItems, subtotal, total: subtotal });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not fetch cart' });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (global.__demoMode) {
      const user = getDemoUserById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const existingItem = user.cart.find((item) => item.product === productId || item.product === String(productId));
      if (existingItem) {
        existingItem.quantity += Number(quantity);
      } else {
        user.cart.push({ product: productId, quantity: Number(quantity) });
      }

      return res.status(200).json({ message: 'Item added to cart' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingItem = user.cart.find((item) => item.product.toString() === productId);

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      user.cart.push({ product: productId, quantity: Number(quantity) });
    }

    await user.save();
    return res.status(200).json({ message: 'Item added to cart' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not add item to cart' });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (global.__demoMode) {
      const user = getDemoUserById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const item = user.cart.find((entry) => entry.product === productId || entry.product === String(productId));
      if (!item) {
        return res.status(404).json({ message: 'Product not found in cart' });
      }

      item.quantity = Number(quantity);
      if (item.quantity <= 0) {
        user.cart = user.cart.filter((entry) => entry.product !== productId && entry.product !== String(productId));
      }

      return res.status(200).json({ message: 'Cart updated' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const item = user.cart.find((entry) => entry.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    item.quantity = Number(quantity);
    if (item.quantity <= 0) {
      user.cart = user.cart.filter((entry) => entry.product.toString() !== productId);
    }

    await user.save();
    return res.status(200).json({ message: 'Cart updated' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not update cart' });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;

    if (global.__demoMode) {
      const user = getDemoUserById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.cart = user.cart.filter((item) => item.product !== productId && item.product !== String(productId));
      return res.status(200).json({ message: 'Item removed from cart' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter((item) => item.product.toString() !== productId);
    await user.save();

    return res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not remove item' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };
