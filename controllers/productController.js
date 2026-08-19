const Product = require('../models/Product');

const getProducts = async (req, res) => {
  try {
    const { category = '', search = '' } = req.query;

    if (global.__demoMode) {
      let products = [...(global.__demoStore?.products || [])];

      if (category && category !== 'All') {
        products = products.filter((product) => product.category === category);
      }

      if (search) {
        const searchText = search.toLowerCase();
        products = products.filter((product) =>
          [product.name, product.description, product.category].some((value) =>
            (value || '').toLowerCase().includes(searchText)
          )
        );
      }

      return res.json(products);
    }

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not fetch products' });
  }
};

const getProductById = async (req, res) => {
  try {
    if (global.__demoMode) {
      const product = (global.__demoStore?.products || []).find((entry) => entry._id === req.params.id || entry.id === req.params.id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      return res.json(product);
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Could not fetch product' });
  }
};

module.exports = { getProducts, getProductById };
