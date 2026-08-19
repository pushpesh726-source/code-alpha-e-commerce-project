const express = require('express');
const { createOrder, getUserOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getUserOrders);
router.post('/', protect, createOrder);

module.exports = router;
